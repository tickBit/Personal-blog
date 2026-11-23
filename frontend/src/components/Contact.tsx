const firstName = import.meta.env.VITE_FIRST_NAME;
const lastName = import.meta.env.VITE_LAST_NAME;
const email = import.meta.env.VITE_EMAIL;

interface Props {
  onContact: () => void;
  onCancel: () => void;
}

export default function Contact(props: Props) {
    return (
        <>
        <div className="mx-auto max-w-md px-4 text-center sm:px-0">
            <h2 className="font-serif text-4xl md:text-4xl font-bold leading-[1.15] text-[var(--foreground)] mb-6">Contact me</h2>
            
            
            <br />
            <p>{firstName} {lastName}</p>
            <br />
            email: {email}
            <br />
            <button className="cursor-pointer font-bold" onClick={() => props.onCancel()}>Back</button>
        </div>
        </>
    )
}