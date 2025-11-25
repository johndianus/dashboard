import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilBasket,
  cilBriefcase, 
  cilEnvelopeClosed, 
  cilCart,
  cilContact,
  cilCog,
  cilPeople,
  cilBuilding
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: '',
    },
  },
  {
    component: CNavTitle,
    name: 'Master',
  },
  {
    component: CNavItem,
    name: 'Organizations',
    to: '/masters/organizations',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Contacts',
    to: '/masters/customers',
    icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Services',
    to: '/masters/services',
    icon: <CIcon icon={cilCart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Users',
    to: '/masters/users',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Transactions',
  },
  {
    component: CNavItem,
    name: 'Opportunity',
    to: '/transactions/opportunity',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  /*{
    component: CNavGroup,
    name: 'Opportunities',
    to: '/base',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Opportunities',
        to: '/transactions/sales',
      },
    ],
  },*/
  {
    component: CNavTitle,
    name: 'Reports',
  },
  /*{
    component: CNavGroup,
    name: 'Opportunities',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Opportunities',
        to: '/reports/sales',
      },
    ],
  },*/
  {
    component: CNavItem,
    name: 'Opportunities',
    to: '/reports/opportunities',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Settings',
  },  
  /*{
    component: CNavItem,
    name: 'Settings',
    to: '/charts',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
  },*/
]

export default _nav
