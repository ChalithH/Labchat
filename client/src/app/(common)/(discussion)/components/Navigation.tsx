'use client'

import Link from 'next/link'

import { Breadcrumb, useBreadcrumb } from '../context/BreadcrumbContext';


const Navigation = () => {
    const { breadcrumbs, setBreadcrumbs } = useBreadcrumb()

    const handleClick = (newBreadcrumbs: Breadcrumb[]) => {
        setBreadcrumbs(newBreadcrumbs)
    }

    return (
        <div className="bg-blue-400 text-white px-2 py-1.5 rounded-[12px] barlow-font inline-block">
            { breadcrumbs!.map( (crumb, idx) => (
                <span key={ idx }>
                    <Link 
                        onClick={ () => handleClick(breadcrumbs!.slice(0, idx + 1))}
                        href={ crumb.href }>
                            { crumb.name }</Link>

                    { idx < breadcrumbs!.length - 1 && <span className="mx-2">{ '>' }</span> }
                </span>
            )) }
        </div>
    )
}

export default Navigation;
