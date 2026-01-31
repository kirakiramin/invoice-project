import HeaderHome from "@/components/header/HeaderHome";
import ClientVisibilityTable from "@/components/clients/ClientVisibilityTable";

const ClientsPage = async () => {
  return (
    <>
      <HeaderHome />
      <main className="site-content">
        <div className="container">
          <div className="main-wrapper">
            <div className="table-container w-900">
              <ClientVisibilityTable />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ClientsPage;
