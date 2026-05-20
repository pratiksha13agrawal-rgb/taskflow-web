export interface NavItem {
  label:    string;
  icon:     string;
  route:    string;
  badge?:   number;
  divider?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon:  'pi pi-home',
    route: '/app/dashboard'
  },
  {
    label: "Today's Tasks",
    icon:  'pi pi-check-square',
    route: '/app/tasks/today',
    badge: 5
  },
  {
    label: 'Completed',
    icon:  'pi pi-check-circle',
    route: '/app/tasks/completed'
  },
  {
    label:   'Calendar',
    icon:    'pi pi-calendar',
    route:   '/app/calendar',
    divider: true
  },
  {
    label: 'Notes',
    icon:  'pi pi-file-edit',
    route: '/app/notes'
  },
  {
    label:   'Habit Tracker',
    icon:    'pi pi-chart-bar',
    route:   '/app/habits',
    divider: true
  },
  {
    label: 'Team',
    icon:  'pi pi-users',
    route: '/app/team'
  },
  {
    label: 'Profile',
    icon:  'pi pi-user',
    route: '/app/profile'
  }
];