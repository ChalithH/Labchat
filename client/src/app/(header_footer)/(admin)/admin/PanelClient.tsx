import React from 'react'
import Admin from './AdminPage'
import LabManager from './LabManagerPage'

type PanelPropTypes = {
    role: string,
    roleId: number
}

const PanelClient = ({ role, roleId }: PanelPropTypes) => {
  if (roleId === 1) 
    return <Admin />
    
  return <LabManager />
}

export default PanelClient
