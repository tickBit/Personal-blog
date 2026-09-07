import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Duration;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.WebDriverManager;

class BlogPostTest {
    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(5));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void userCanPublishBlogPost() {
        driver.get("http://localhost:8443");

        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[.//span[normalize-space()='New Post']]"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("input[placeholder='The title of your post']")))
                .sendKeys("Selenium test post");
        driver.findElement(By.cssSelector("textarea[placeholder='A short teaser for the post…']"))
                .sendKeys("Test excerpt");
        driver.findElement(By.cssSelector("textarea[placeholder='Write the full post here…']"))
                .sendKeys("Test body");

        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[normalize-space()='Publish Post']"))).click();

        WebElement title = wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[normalize-space()='Selenium test post']")));

        assertEquals("Selenium test post", title.getText());
    }
}