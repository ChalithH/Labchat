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
            href: "/home",
        },
        {
            title: "Login",
            href: "/login",
        },
        {
            title: "Register",
            href: "/register",
        },
    ],
};

export const GuestSiteConfig: navItems = {
    navItems: [
        {
            title: "Home",
            href: "/home",
        },
        {
            title: "Admission",
            href: "/admission",
        },
    ],
};


export const loggedInsiteConfig: navItems = {
    navItems: [
        {
            title: "Admissions",
            href: "/admission",
        },
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
        }
    ],
};

export const managerInsiteConfig: navItems = {
    navItems: [
        {
            title: "Admissions",
            href: "/admission",
        },
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
        {
            title: "Manage Lab",
            href: "/admin/manage-lab/",
        },
    ],
};


export const adminInsiteConfig: navItems = {
    navItems: [
        {
            title: "Admin Dashboard",
            href: "/admin/dashboard",
        },
        {
            title: "Admission",
            href: "/admission",
        }
    ],
};

