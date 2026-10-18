import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Properties;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class BlogPostTest {
    private static final String BASE_URL = "http://localhost:8443";

    private WebDriver driver;
    private WebDriverWait wait;

    private Duration duration = Duration.ofSeconds(10);
    
    @BeforeEach
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");

        
        driver = new ChromeDriver(options);
        if (duration != null)
            wait = new WebDriverWait(driver, duration);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void userCanPublishBlogPost() throws IOException {
        Properties credentials = loadAdminCredentials();
        String postTitle = "Selenium test post " + System.currentTimeMillis();

        driver.get(BASE_URL);
        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//dialog//button[normalize-space()='No / Ei']"))).click();
        String username = credentials.getProperty("ADMIN_USERNAME");
        String password = credentials.getProperty("ADMIN_PASSWORD");
        Object loginResult = ((JavascriptExecutor) driver).executeAsyncScript("""
            const username = arguments[0];
            const password = arguments[1];
            const done = arguments[arguments.length - 1];
            fetch('http://localhost:8080/auth/login', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({username, password})
            }).then(async response => {
              if (!response.ok) {
                done(`HTTP ${response.status}`);
                return;
              }
              const data = await response.json();
              localStorage.setItem('blog_folio_access_token', data.accessToken);
              localStorage.setItem('blog_folio_refresh_token', data.refreshToken);
              done('ok');
            }).catch(error => done(error.message));
            """, username, password);
        assertEquals("ok", loginResult, "Admin login failed");
        driver.navigate().refresh();
        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//dialog//button[normalize-space()='No / Ei']"))).click();

        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[.//span[normalize-space()='New Post']]"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("input[placeholder='The title of your post']")))
                .sendKeys(postTitle);
        driver.findElement(By.cssSelector("textarea[placeholder='A short teaser for the post…']"))
                .sendKeys("Test excerpt");
        driver.findElement(By.cssSelector("textarea[placeholder='Write the full post here…']"))
                .sendKeys("Test body");
        driver.findElement(By.cssSelector("input[placeholder='writing, craft, notes']"))
                .sendKeys("selenium", Keys.TAB);

        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Publish Post']"))).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(
            By.xpath("//button[normalize-space()='Publish Post']")));
        driver.navigate().refresh();
        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//dialog//button[normalize-space()='No / Ei']"))).click();

        WebElement title = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[normalize-space()=" + xpathLiteral(postTitle) + "]")));

        assertEquals(postTitle, title.getText());
    }

    private String xpathLiteral(String value) {
        return "'" + value.replace("'", "") + "'";
    }

    private Properties loadAdminCredentials() throws IOException {
        String username = System.getenv("ADMIN_USERNAME");
        String password = System.getenv("ADMIN_PASSWORD");

        if (username != null && !username.isBlank()
                && password != null && !password.isBlank()) {
            Properties credentials = new Properties();
            credentials.setProperty("ADMIN_USERNAME", username);
            credentials.setProperty("ADMIN_PASSWORD", password);
            return credentials;
        }

        Path envFile = Files.exists(Path.of("backend", ".env"))
                ? Path.of("backend", ".env")
                : Path.of("..", "backend", ".env");
        Properties credentials = new Properties();
        try (Reader reader = Files.newBufferedReader(envFile)) {
            credentials.load(reader);
        }

        if (credentials.getProperty("ADMIN_USERNAME", "").isBlank()
                || credentials.getProperty("ADMIN_PASSWORD", "").isBlank()) {
            throw new IllegalStateException(
                    "Set ADMIN_USERNAME and ADMIN_PASSWORD or define them in backend/.env");
        }
        return credentials;
    }
}
