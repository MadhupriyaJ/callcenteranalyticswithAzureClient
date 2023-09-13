import React, { useEffect, useRef, useState } from "react";

const AsideBk = ({ selectedTable, onTableSelect }) => {
  const [asideOpen, setAsideOpen] = useState(true);
  const [tablename, setTablename] = useState([]);
  const [dataTable, setDataTable] = useState(null);
  const [tabledetails, setTabledetails] = useState([]);
  // const [selectedTable, setSelectedTable] = useState("");
  const tableRef = useRef();



  useEffect(() => {
    console.log("Fetching table names...");
    fetchTablename();
  }, []);

 
  //To get All Table from server
  const fetchTablename = async () => {
    try {
      const response = await fetch("/gettablename");
      const data = await response.json();
      console.log("Fetched table names for aside:", data);
      setTablename(data);
    } catch (error) {
      console.error("Error fetching table names:", error);
    }
  };

  // const fetchTableData = async (tableName) => {
  //   try {
  //     const response = await fetch("/tablecategorieswithvalue", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ tableName }),
  //     });

  //     const data = await response.json();
  //     console.log("Fetched table data for", tableName, ":", data);
  //     setTabledetails(data);

  //     // Destroy the DataTable if it exists
  //     if (dataTable !== null) {
  //       dataTable.destroy();
  //     }

  //     // Initialize DataTable for the current tableRef
  //     const newDataTable = $(tableRef.current).DataTable({
  //       searching: true, // Enable searching
  //     });
  //     console.log("DataTable initialized:", newDataTable);
  //     setDataTable(newDataTable);
  //   } catch (error) {
  //     console.error("Error fetching table data:", error);
  //   }
  // };

  
  const fetchTableData = async (tableName) => {
    try {
      const response = await fetch("/tablecategorieswithvalue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }),
      });

      const data = await response.json();
      console.log("Fetched table data for", tableName, ":", data);
      setTabledetails(data);

      // Destroy the DataTable if it exists
      if (dataTable !== null) {
        dataTable.destroy();
      }

      // Call the callback function to pass the selected table name
      onTableSelect(tableName);

      // Initialize DataTable for the current tableRef
      const newDataTable = $(tableRef.current).DataTable({
        searching: true, // Enable searching
      });
      console.log("DataTable initialized:", newDataTable);
      setDataTable(newDataTable);
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };
  const toggleAside = () => {
    setAsideOpen((prevAsideOpen) => !prevAsideOpen);
  };
  const openNav = () => {
    setAsideOpen(true);
  };
  const closeNav = () => {
    setAsideOpen(false);
  };

  return (
    <div
      className="{`aside ${asideOpen ? 'open' : ''}`}"
      onMouseEnter={openNav}
    >
      <div
        id="kt_aside"
        className={`aside aside-white aside-hoverable mt-0 sidenav h-full  ${
          asideOpen ? "w-64" : "w-14"
        } duration-300 h-full bg-slate-900 text-white relative`}
        data-kt-drawer="false"
        data-kt-drawer-name="aside"
        data-kt-drawer-activate="{default: true, lg: false}"
        data-kt-drawer-overlay="true"
        data-kt-drawer-width="{default:'200px', '300px': '250px'}"
        data-kt-drawer-direction="start"
        data-kt-drawer-toggle="#kt_aside_mobile_toggle"
      >
        <div class="aside-logo flex-column-auto " id="kt_aside_logo">
          {/*<!--begin::Logo--> */}
          <a href="../../demo1/dist/index.html">
            {asideOpen ? (
              <div class="aside-logo flex-column-auto " id="kt_aside_logo">
                <a href="/">
                  <img
                    alt="Logo"
                    src="assets/media/logos/snowflake-logo.png"
                    class="w-44 p-4"
                  />
                </a>
              </div>
            ) : (
              <div class="aside-logo flex-column-auto " id="kt_aside_logo">
                <a href="../../demo1/dist/index.html">
                  <img
                    alt="Logo"
                    src="assets/media/logos/snowflake-logo.png"
                    class="w-26" // Adjust the size as needed (50% size)
                  />
                </a>
              </div>
            )}
          </a>
          {/*<!--end::Logo--> */}
          {/*<!--begin::Aside toggler--> */}
          <div
            id="kt_aside_toggle"
            class="btn btn-icon"
            onClick={toggleAside}
            data-kt-toggle="true"
            data-kt-toggle-state="active"
            data-kt-toggle-target="body"
            data-kt-toggle-name="aside-minimize"
          >
            {/*<!--begin::Svg Icon | path: icons/duotune/arrows/arr079.svg--> */}
            <span
              class="svg-icon svg-icon-1"
              className={`absolute z-20 cursor-pointer rounded-lg bg-slate-300 hover:bg-slate-100 -right-3 top-16 w-7 ${
                !asideOpen && "rotate-180 duration-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  opacity="0.5"
                  d="M14.2657 11.4343L18.45 7.25C18.8642 6.83579 18.8642 6.16421 18.45 5.75C18.0358 5.33579 17.3642 5.33579 16.95 5.75L11.4071 11.2929C11.0166 11.6834 11.0166 12.3166 11.4071 12.7071L16.95 18.25C17.3642 18.6642 18.0358 18.6642 18.45 18.25C18.8642 17.8358 18.8642 17.1642 18.45 16.75L14.2657 12.5657C13.9533 12.2533 13.9533 11.7467 14.2657 11.4343Z"
                  fill="blue"
                ></path>
                <path
                  d="M8.2657 11.4343L12.45 7.25C12.8642 6.83579 12.8642 6.16421 12.45 5.75C12.0358 5.33579 11.3642 5.33579 10.95 5.75L5.40712 11.2929C5.01659 11.6834 5.01659 12.3166 5.40712 12.7071L10.95 18.25C11.3642 18.6642 12.0358 18.6642 12.45 18.25C12.8642 17.8358 12.8642 17.1642 12.45 16.75L8.2657 12.5657C7.95328 12.2533 7.95328 11.7467 8.2657 11.4343Z"
                  fill="blue"
                ></path>
              </svg>
            </span>
            {/*<!--end::Svg Icon--> */}
          </div>
          {/*<!--end::Aside toggler--> */}
        </div>
        <div class="aside-menu flex-column-fluid ">
          <div
            class="hover-scroll-overlay-y my-5 my-lg-5 "
            id="kt_aside_menu_wrapper"
            data-kt-scroll="true"
            data-kt-scroll-activate="{default: false, lg: true}"
            data-kt-scroll-height="auto"
            data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
            data-kt-scroll-wrappers="#kt_aside_menu"
            data-kt-scroll-offset="0"
            // style="height: 422px;"
          >
            <div
              class="menu menu-column menu-title-gray-600 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 "
              id="#kt_aside_menu"
              data-kt-menu="true"
            >
              <div class="menu-item  ">
                <div class="menu-content pb-2">
                  {asideOpen && (
                    <span class="menu-section text-muted text-uppercase fs-8 ls-1">
                      Dashboard
                    </span>
                  )}
                </div>
              </div>
              <div class="menu-item ">
                <a class="menu-link " href="#">
                  <span class="menu-icon ">
                    {/*<!--begin::Svg Icon | path: icons/duotune/general/gen025.svg--> */}
                    <span class="svg-icon svg-icon-2 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="9"
                          height="9"
                          rx="2"
                          fill="white"
                        ></rect>
                        <rect
                          opacity="0.3"
                          x="13"
                          y="2"
                          width="9"
                          height="9"
                          rx="2"
                          fill="white"
                        ></rect>
                        <rect
                          opacity="0.3"
                          x="13"
                          y="13"
                          width="9"
                          height="9"
                          rx="2"
                          fill="white"
                        ></rect>
                        <rect
                          opacity="0.3"
                          x="2"
                          y="13"
                          width="9"
                          height="9"
                          rx="2"
                          fill="white"
                        ></rect>
                      </svg>
                    </span>
                  
                  </span>
                  <span class="menu-title ">Default</span>
                </a>
              </div>
              {/* <div class="menu-item">
                <a class="menu-link active" href="#">
                  <span class="menu-icon">
                  
                    <span class="svg-icon svg-icon-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="25"
                        viewBox="0 0 24 25"
                        fill="none"
                      >
                        <path
                          opacity="0.3"
                          d="M8.9 21L7.19999 22.6999C6.79999 23.0999 6.2 23.0999 5.8 22.6999L4.1 21H8.9ZM4 16.0999L2.3 17.8C1.9 18.2 1.9 18.7999 2.3 19.1999L4 20.9V16.0999ZM19.3 9.1999L15.8 5.6999C15.4 5.2999 14.8 5.2999 14.4 5.6999L9 11.0999V21L19.3 10.6999C19.7 10.2999 19.7 9.5999 19.3 9.1999Z"
                          fill="white"
                        ></path>
                        <path
                          d="M21 15V20C21 20.6 20.6 21 20 21H11.8L18.8 14H20C20.6 14 21 14.4 21 15ZM10 21V4C10 3.4 9.6 3 9 3H4C3.4 3 3 3.4 3 4V21C3 21.6 3.4 22 4 22H9C9.6 22 10 21.6 10 21ZM7.5 18.5C7.5 19.1 7.1 19.5 6.5 19.5C5.9 19.5 5.5 19.1 5.5 18.5C5.5 17.9 5.9 17.5 6.5 17.5C7.1 17.5 7.5 17.9 7.5 18.5Z"
                          fill="white"
                        ></path>
                      </svg>
                    </span>
                  
                  </span>
                  <span class="menu-title">Roles</span>
                </a>
              </div>
              <div class="menu-item">
                <a
                  class="menu-link"
                  href="../../demo1/dist/dashboards/only-header.html"
                >
                  <span class="menu-icon">
               
                    <span class="svg-icon svg-icon-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          opacity="0.3"
                          d="M20 21H3C2.4 21 2 20.6 2 20V10C2 9.4 2.4 9 3 9H20C20.6 9 21 9.4 21 10V20C21 20.6 20.6 21 20 21Z"
                          fill="white"
                        ></path>
                        <path
                          d="M20 7H3C2.4 7 2 6.6 2 6V3C2 2.4 2.4 2 3 2H20C20.6 2 21 2.4 21 3V6C21 6.6 20.6 7 20 7Z"
                          fill="white"
                        ></path>
                      </svg>
                    </span>
                   
                  </span>
                  <span class="menu-title">Users List</span>
                </a>
              </div> */}
            </div>
            <div
              class="menu menu-column menu-title-gray-600 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 "
              id="#kt_aside_menu"
              data-kt-menu="true"
            >
              <div class="menu-item  ">
                <div class="menu-content pb-2">
                  {asideOpen && (
                    <span class="menu-section text-muted text-uppercase fs-8 ls-1">
                      Administrator
                    </span>
                  )}
                </div>
              </div>
              {tablename.map((table, index) => (
                <div class="menu-item " key={index}>
                  <p class="menu-link" onClick={() => fetchTableData(table.TABLE_NAME)}>
                    <span class="menu-icon ">
                      {/*<!--begin::Svg Icon | path: icons/duotune/general/gen025.svg--> */}
                      <span class="svg-icon svg-icon-2 ">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.2929 2.70711C11.6834 2.31658 12.3166 2.31658 12.7071 2.70711L15.2929 5.29289C15.6834 5.68342 15.6834 6.31658 15.2929 6.70711L12.7071 9.29289C12.3166 9.68342 11.6834 9.68342 11.2929 9.29289L8.70711 6.70711C8.31658 6.31658 8.31658 5.68342 8.70711 5.29289L11.2929 2.70711Z"
                            fill="currentColor"
                          />
                          <path
                            d="M11.2929 14.7071C11.6834 14.3166 12.3166 14.3166 12.7071 14.7071L15.2929 17.2929C15.6834 17.6834 15.6834 18.3166 15.2929 18.7071L12.7071 21.2929C12.3166 21.6834 11.6834 21.6834 11.2929 21.2929L8.70711 18.7071C8.31658 18.3166 8.31658 17.6834 8.70711 17.2929L11.2929 14.7071Z"
                            fill="currentColor"
                          />
                          <path
                            opacity="0.3"
                            d="M5.29289 8.70711C5.68342 8.31658 6.31658 8.31658 6.70711 8.70711L9.29289 11.2929C9.68342 11.6834 9.68342 12.3166 9.29289 12.7071L6.70711 15.2929C6.31658 15.6834 5.68342 15.6834 5.29289 15.2929L2.70711 12.7071C2.31658 12.3166 2.31658 11.6834 2.70711 11.2929L5.29289 8.70711Z"
                            fill="currentColor"
                          />
                          <path
                            opacity="0.3"
                            d="M17.2929 8.70711C17.6834 8.31658 18.3166 8.31658 18.7071 8.70711L21.2929 11.2929C21.6834 11.6834 21.6834 12.3166 21.2929 12.7071L18.7071 15.2929C18.3166 15.6834 17.6834 15.6834 17.2929 15.2929L14.7071 12.7071C14.3166 12.3166 14.3166 11.6834 14.7071 11.2929L17.2929 8.70711Z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                      {/*<!--end::Svg Icon--> */}
                    </span>
                    <span
                      class="menu-title"
                      // key={index}
                      // value={table.TABLE_NAME}
                    >
                      {table.TABLE_NAME}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsideBk;
