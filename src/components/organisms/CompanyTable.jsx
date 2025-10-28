import { useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import companyService from "@/services/api/companyService";

const CompanyTable = ({ companies, onEdit, onRefresh }) => {
  const [deleteCompany, setDeleteCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteCompany) return;
    
    setLoading(true);
    try {
      await companyService.delete(deleteCompany.Id);
      toast.success("Company deleted successfully");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete company");
    } finally {
      setLoading(false);
      setDeleteCompany(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.Id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {(company.name_c || company.Name || "?").charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name_c || company.Name || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.address_c || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.phone_c || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.email_c || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(company)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCompany(company)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteCompany}
        onClose={() => setDeleteCompany(null)}
        onConfirm={handleDelete}
        title="Delete Company"
        message={`Are you sure you want to delete ${deleteCompany?.name_c || deleteCompany?.Name}? This action cannot be undone.`}
        confirmLabel={loading ? "Deleting..." : "Delete"}
        variant="danger"
      />
    </>
  );
};

export default CompanyTable;