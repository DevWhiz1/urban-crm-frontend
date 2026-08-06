import React from 'react';
import { X, Briefcase, Mail, Phone, MapPin, FileText, Activity } from 'lucide-react';
import { Employee } from '../../types/employee';

interface Props {
  employee: Employee;
  onClose: () => void;
}

const EmployeeViewModal: React.FC<Props> = ({ employee, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-8 py-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center text-3xl font-bold text-blue-700">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employee.fullName}</h2>
              <p className="text-gray-500 mt-1 font-medium">{employee.role}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{employee.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                    <span>{employee.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Personal</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="text-gray-500 w-24 inline-block">ID:</span> {employee.employeeId || 'N/A'}</p>
                  <p><span className="text-gray-500 w-24 inline-block">CNIC:</span> {employee.cnic}</p>
                  <p><span className="text-gray-500 w-24 inline-block">Emergency:</span> {employee.emergencyContact || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Employment</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{employee.department || 'No Dept'} - {employee.designation || 'No Desig'}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Activity className="w-5 h-5 mr-3 text-gray-400" />
                    <span>{employee.employmentType} (Joined: {new Date(employee.joiningDate).toLocaleDateString()})</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Status & Compensation</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="text-gray-500 w-24 inline-block">Status:</span>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      employee.status === 'Active' ? 'bg-green-100 text-green-700' :
                      employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {employee.status}
                    </span>
                  </p>
                  <p><span className="text-gray-500 w-24 inline-block">Salary:</span> Rs {employee.salary?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-400" /> Documents
            </h3>
            {employee.documents && employee.documents.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {employee.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-blue-600 font-medium transition-colors"
                  >
                    {doc.name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No documents attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeViewModal;
