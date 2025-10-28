import { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import CompanyTable from "@/components/organisms/CompanyTable";
import CompanyForm from "@/components/organisms/CompanyForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import companyService from "@/services/api/companyService";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await companyService.getAll();
      if (!data || data.length === 0) {
        setCompanies([]);
      } else {
        setCompanies(data);
      }
    } catch (err) {
      setError("Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleAddCompany = () => {
    setEditCompany(null);
    setShowForm(true);
  };

  const handleEditCompany = (company) => {
    setEditCompany(company);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditCompany(null);
  };

  const handleFormSuccess = () => {
    loadCompanies();
  };

  if (loading) {
    return (
      <div>
        <Header 
          title="Companies"
          action={true}
          actionLabel="Add Company"
          onAction={handleAddCompany}
        />
        <div className="p-6">
          <Loading variant="table" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header 
          title="Companies"
          action={true}
          actionLabel="Add Company"
          onAction={handleAddCompany}
        />
        <div className="p-6">
          <Error message={error} onRetry={loadCompanies} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Companies"
        action={true}
        actionLabel="Add Company"
        onAction={handleAddCompany}
      />
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {companies.length === 0 ? (
            <Empty
              message="No companies yet"
              description="Add your first company to get started with managing your CRM"
              actionLabel="Add Company"
              onAction={handleAddCompany}
              icon="Building2"
            />
          ) : (
            <CompanyTable
              companies={companies}
              onEdit={handleEditCompany}
              onRefresh={loadCompanies}
            />
          )}
        </div>
      </div>

      <CompanyForm
        isOpen={showForm}
        onClose={handleFormClose}
        company={editCompany}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default Companies;