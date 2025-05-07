export default function Footer() {
    return (
        <div className='bg-[#F5F7FA] pt-10'>
            <footer className="relative w-full h-[200] bg-[#284AA3] flex flex-col items-left justify-center text-white font-play font-bold">
                <h4 className="mt-10 ml-5 mb-20">Reach Us</h4>

                <div className="flex flex-row items-center justify-between gap-x-10 mt-5 mb-5">
                    <div className="flex flex-col items-left justify-center gap-y-2 ml-5">
                        <h4 className="">Legal</h4>
                        <h4 className="font-light">Privacy Policy</h4>
                        <h4 className="font-light">Terms & Service</h4>
                        <h4 className="font-light">Terms of Use</h4>
                    </div>
                    <div className="flex flex-col items-left justify-center gap-y-2 mr-5">
                        <h4 className="">Company</h4>
                        <h4 className="font-light">About</h4>
                        <h4 className="font-light">Contact Us</h4>
                        <h4 className="font-light">Events</h4>
                    </div>
                </div>
                <div className="w-full bg-[#111F44] flex flex-col items-center justify-center">
                    <p className=" text-xs barlow-font mt-1 mb-2">© 2025 Binary Bandits. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}