// Export all API functions from a single file for easier imports
export * from "./categories";
export * from "./departments";
export * from "./equipment";
export * from "./maintenance";
export * from "./users";
export * from "./settings";
export * from "./reports";
// Rename exports from supply chain departments to avoid conflicts
export {
  Department as SupplyChainDepartment,
  DepartmentInsert as SupplyChainDepartmentInsert,
  DepartmentUpdate as SupplyChainDepartmentUpdate,
  createDepartment as createSupplyChainDepartment,
  deleteDepartment as deleteSupplyChainDepartment,
  getDepartmentById as getSupplyChainDepartmentById,
  getDepartments as getSupplyChainDepartments,
  updateDepartment as updateSupplyChainDepartment,
} from "./supplyChain/departments";
export * from "./supplyChain/materialRequests";
export * from "./supplyChain/proformaInvoices";
export * from "./documentFiles";
export * from "./tasks";
