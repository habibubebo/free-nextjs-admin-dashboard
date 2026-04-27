"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import { useSession } from "../hooks/useSession";
import { isPageAccessible } from "@/lib/roleUtils";
import { getProfil } from "@/app/actions/profilActions";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  alwaysOpen?: boolean;
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <CalenderIcon />,
    name: "Schedule",
    path: "/schedule",
  },
  {
    name: "Institute Management",
    icon: <ListIcon />,
    subItems: [
      { name: "Profil Lembaga", path: "/institution-profile" },
      { name: "Instructors", path: "/instructors" },
      { name: "Classes", path: "/classes" },
      { name: "Course Units", path: "/course-units" },
      { name: "Students", path: "/students" },
      { name: "Attendance", path: "/attendance" },
      { name: "Attendance Report", path: "/attendance-report" },
      { name: "Graduates", path: "/graduates" },
    ],
    alwaysOpen: true,
  },
  {
    icon: <ListIcon />,
    name: "My Attendance",
    path: "/attendance",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { session, loading } = useSession();
  const [profil, setProfil] = useState<any>(null);

  useEffect(() => {
    async function fetchProfil() {
      const data = await getProfil();
      setProfil(data);
    }
    fetchProfil();
  }, []);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Filter menu items based on role
  const getFilteredNavItems = () => {
    if (!session) return [];
    
    return navItems.map(item => {
      if (item.name === "My Attendance") {
        if (session.role === 'instructor') {
          return item;
        }
        return null;
      }
      
      if (item.name === "Institute Management") {
        if (session.role === 'superadmin') {
          if (item.subItems) {
            const filteredSubItems = item.subItems.filter(subItem =>
              isPageAccessible(session.role, subItem.path)
            );
            
            if (filteredSubItems.length === 0) return null;
            
            return {
              ...item,
              subItems: filteredSubItems,
            };
          }
        }
        return null;
      }
      
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(subItem =>
          isPageAccessible(session.role, subItem.path)
        );
        
        if (filteredSubItems.length === 0) return null;
        
        return {
          ...item,
          subItems: filteredSubItems,
        };
      }
      
      if (item.path && !isPageAccessible(session.role, item.path)) {
        return null;
      }
      
      return item;
    }).filter(Boolean) as NavItem[];
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <>
              <button
                onClick={() => !nav.alwaysOpen && handleSubmenuToggle(index, "main")}
                className={`menu-item group ${
                  !nav.alwaysOpen && openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                } ${nav.alwaysOpen ? "cursor-default" : ""}`}
              >
                <span
                  className={`${
                    !nav.alwaysOpen && openSubmenu?.type === "main" && openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && !nav.alwaysOpen && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === "main" && openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`main-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      nav.alwaysOpen
                        ? "auto"
                        : openSubmenu?.type === "main" && openSubmenu?.index === index
                        ? `${subMenuHeight[`main-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge `}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
        </li>
      ))}
    </ul>
  );

  useEffect(() => {
    let submenuMatched = false;
    const filteredItems = getFilteredNavItems();
    
    filteredItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            if (!nav.alwaysOpen) {
              setOpenSubmenu({
                type: "main",
                index,
              });
            }
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched && !filteredItems.some(n => n.alwaysOpen)) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, session]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  if (loading) {
    return (
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
          isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
          <Link href="/">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
                <Image className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
              </>
            ) : (
              <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
            )}
          </Link>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                  {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
                </h2>
                <ul className="flex flex-col gap-4">
                  <li>
                    <Link href="/" className="menu-item group menu-item-inactive">
                      <span className="menu-item-icon-inactive"><GridIcon /></span>
                      {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Dashboard</span>}
                    </Link>
                  </li>
                  <li>
                    <button className="menu-item group menu-item-inactive cursor-default">
                      <span className="menu-item-icon-inactive"><ListIcon /></span>
                      {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Loading...</span>}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </aside>
    );
  }

  const filteredNavItems = getFilteredNavItems();

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/" className="flex items-center gap-3">
          {profil?.Logo ? (
            <>
              <Image width={40} height={40} src={profil.Logo} alt="Logo" className="rounded-lg" />
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="font-semibold text-gray-800 dark:text-white">{profil?.Namalkp || "Lembaga Pelatihan"}</span>
              )}
            </>
          ) : (
            <>
              <Image className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <Image className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(filteredNavItems)}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;