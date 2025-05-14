export type SiteConfig = {
    name: string;
    description: string;
    navItems: {
        title: string;
        href: string;
    }[];
};

export const loggedOutsiteConfig: SiteConfig = {
    name: "Labchat",
    description: "Labchat is a web application that allows users to chat with each other in real-time.",
    navItems: [
        {
            title: "Home",
            href: "#home",
        },
        {
            title: "About",
            href: "#about",
        },
        {
            title: "Contact",
            href: "#contact",
        },
    ],
};

export const loggedInsiteConfig: SiteConfig = {
    name: "Labchat",
    description: "Labchat is a web application that allows users to chat with each other in real-time.",
    navItems: [
        {
            title: "Home",
            href: "/home",
        },
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Inventory",
            href: "/inventory",
        },
        {
            title: "Calendar",
            href: "/calendar",
        },
        {
            title: "Discussion Board",
            href: "/discussion/home",
        },
        {
            title: "Members",
            href: "/members",
        },
    ],
};
