export type navItems = {
    navItems: {
        title: string;
        href: string;
    }[];
};

export type SiteConfig = {
    name: string;
    description: string;
    siteName: string; // Optional, can be used for Open Graph or other metadata
    siteUrl: string; // Optional, can be used for absolute URLs in links
    locale: string; // Optional, can be used for Open Graph locale
};

export const siteConfig: SiteConfig = {
    name: "Labchat",
    description: "Labchat is a web application that allows users to chat with each other in real-time.",
    locale: "en-NZ",
    siteName: "Labchat",
    siteUrl: "https://www.labchatuoa.com", 
};

export const loggedOutsiteConfig: navItems = {
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

export const loggedInsiteConfig: navItems = {
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
