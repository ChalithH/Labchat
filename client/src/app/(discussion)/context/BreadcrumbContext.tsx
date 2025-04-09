'use client'

import { useState, createContext, useContext, useEffect } from "react"

export type Breadcrumb = {
    name: string
    href: string
}

type BreadcrumbContextType = {
    breadcrumbs: Breadcrumb[] | null
    setBreadcrumbs: (breadcrumbs: Breadcrumb[] | null) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

export const BreadcrumbProvider = ({ children }:{ children: React.ReactNode }) => {
    const [ breadcrumbs, setBreadcrumbsState ] = useState<Breadcrumb[] | null>([{ name: 'Home', href: '/discussion/home' }])
    const [ breadcrumbHistory, setBreadcrumbHistory ] = useState<Breadcrumb[][]>([])

    useEffect(() => {
        const stored = localStorage.getItem('breadcrumbs')
        if (stored)
            setBreadcrumbsState(JSON.parse(stored))
    }, [])
    
    useEffect(() => {
        if (breadcrumbs)
            localStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs))
    }, [ breadcrumbs ])

    const setBreadcrumbs = (breadcrumbs: Breadcrumb[] | null) => {
        if (breadcrumbs)
            setBreadcrumbHistory( prev_history => [...prev_history, breadcrumbs])

        setBreadcrumbsState(breadcrumbs)
    }

    const resetBreadcrumbs = () => {
        setBreadcrumbHistory(prevHistory => {
            const new_history = [ ...prevHistory ]
            new_history.pop()
            return new_history
        })
        
        const last_breadcrumbs = breadcrumbHistory[breadcrumbHistory.length - 1]
        setBreadcrumbsState(last_breadcrumbs || [])
    }

    return(
        <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            { children }
        </BreadcrumbContext.Provider>
    )
} 

export const useBreadcrumb = () => {
    const context = useContext(BreadcrumbContext)
    if (!context)
        throw new Error('Uh oh. You breadcrumbed it')

    return context
}