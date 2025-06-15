export default function Footer() {
    return (
        // No changes needed here. The parent layout handles the sticky positioning.
        <div className="pt-0">
            <footer className="relative w-full h-[5vh] bg-labchat-blue-500 flex flex-col items-left justify-center text-zinc-50 font-play font-bold">
                <div className="w-full flex flex-col items-center justify-center">
                    <p className=" text-s barlow-font p-2">© 2025 Binary Bandits. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}