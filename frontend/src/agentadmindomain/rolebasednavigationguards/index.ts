const mergedRoutes: RouteRecordRaw[] = [
    {
      path: "/agent-admin",
      name: "agent-admin-home",
      component: MainLayout,
      meta: { requiresAuth: true, roles: ["agent-admin"] }, // Only Agent Admins
      redirect: "/agent-admin/dashboard",
      children: [
        { name: "app-dashboard", path: "/agent-admin/dashboard", component: DashboardTab },
        { name: "app-entities", path: "/agent-admin/entities", component: AppEntities },
        { name: "app-agents", path: "/agent-admin/agents", component: AppAgents },
      ],
    },
    {
      path: "/branch-manager",
      name: "branch-manager-home",
      component: BranchManagerLayout,
      meta: { requiresAuth: true, roles: ["branch-manager"] }, // Only Branch Managers
      redirect: "/branch-manager/dashboard",
      children: [
        { name: "branch-manager-app-dashboard", path: "/branch-manager/dashboard", component: BranchManagerDashboardTab },
      ],
    },
    {
      path: "/till-operator",
      name: "till-operator-home",
      component: AgentLayout,
      meta: { requiresAuth: true, roles: ["till-operator"] }, // Only Till Operators
      redirect: "/till-operator/services",
      children: [
        { name: "agent-app-services", path: "/till-operator/services", component: AgentAppServices },
      ],
    },
  ];

  



  router.beforeEach((to, from, next) => {
    const { credentials, refreshToken } = useAuth(); // Get authentication data
    const isAuthenticated = !!credentials.value; // Check if user is authenticated
    const userRole = credentials.value?.role; // Assume role is stored in credentials
    const isTokenExpired = refreshToken.value ? refreshToken.value.exp < moment().unix() : true;
  
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!isAuthenticated || isTokenExpired) {
        return next({ name: "app-account-sign-in" }); // Redirect if not authenticated
      }
  
      // Check if the route has role restrictions
      if (to.meta.roles && !to.meta.roles.includes(userRole)) {
        return next({ name: "app-dashboard" }); // Redirect unauthorized users to a safe page
      }
  
      return next();
    }
  
    // Prevent authenticated users from accessing login page
    if (to.name === "app-account-sign-in" && isAuthenticated) {
      return next({ name: "agent-admin-home" });
    }
  
    next(); // Proceed normally
  });
  