import employeesData from '@/data/employees.json'
import type { Employee } from '@/api/client'
import { normalizeEmployeeForDemo } from '@/lib/demoDomain'

function cloneEmployee(employee: Employee): Employee {
  return {
    ...employee,
    businessUnit: employee.businessUnit ? { ...employee.businessUnit } : null,
    department: employee.department ? { ...employee.department } : null,
    jobTitle: employee.jobTitle ? { ...employee.jobTitle } : null,
    manager: employee.manager ? { ...employee.manager } : null,
  }
}

const rawDemoEmployees = employeesData as Employee[]
const demoEmployees = rawDemoEmployees.map((employee) => normalizeEmployeeForDemo(employee))
const employeeById = new Map(demoEmployees.map((employee) => [employee.id, employee]))
const employeeByDisplayName = new Map(
  demoEmployees.map((employee) => [employee.displayName ?? '', employee]),
)

export function cloneDemoEmployees(): Employee[] {
  return demoEmployees.map((employee) => cloneEmployee(employee))
}

export function getDemoEmployeeById(id: string | null | undefined): Employee | null {
  const employee = id ? employeeById.get(id) : undefined
  return employee ? cloneEmployee(employee) : null
}

export function getDemoEmployeeByDisplayName(name: string | null | undefined): Employee | null {
  const employee = name ? employeeByDisplayName.get(name) : undefined
  return employee ? cloneEmployee(employee) : null
}
