// Types & Enums
export type Designation = 'CEO' | 'Director' | 'Manager' | 'Lead' | 'Engineer';

export interface EmployeeData {
  id: string;
  name: string;
  dateOfBirth: string; // mm/dd/yyyy
  designation: Designation;
  reportsTo?: string; // Optional for CEO
}

// Designation hierarchy rules: Role -> Role it must report to
const HIERARCHY_RULES: Record<Designation, Designation | null> = {
  CEO: null,
  Director: 'CEO',
  Manager: 'Director',
  Lead: 'Manager',
  Engineer: 'Lead',
};

// Base Abstract Employee Class
export abstract class Employee {
  public readonly id: string;
  public name: string;
  public dateOfBirth: string;
  public readonly designation: Designation;
  public reportsTo?: string;
  public reportees: string[] = [];

  constructor(id: string, name: string, dateOfBirth: string, designation: Designation, reportsTo?: string) {
    this.validateDate(dateOfBirth);
    if (!id || id.trim() === '') throw new Error('Employee ID cannot be empty.');
    if (!name || name.trim() === '') throw new Error('Employee name cannot be empty.');

    this.id = id;
    this.name = name;
    this.dateOfBirth = dateOfBirth;
    this.designation = designation;
    this.reportsTo = reportsTo;
  }

  private validateDate(dob: string): void {
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(dob)) {
      throw new Error(`Invalid date format for ${dob}. Required format: mm/dd/yyyy.`);
    }
  }

  public getDetails(): string {
    return `[${this.designation}] ID: ${this.id} | Name: ${this.name} | DOB: ${this.dateOfBirth} | Reports To: ${this.reportsTo || 'None'} | Reportees: [${this.reportees.join(', ')}]`;
  }
}

// Specific Designation Classes
export class CEO extends Employee {
  constructor(id: string, name: string, dateOfBirth: string) {
    super(id, name, dateOfBirth, 'CEO');
  }
}

export class Director extends Employee {
  constructor(id: string, name: string, dateOfBirth: string, reportsTo: string) {
    super(id, name, dateOfBirth, 'Director', reportsTo);
  }
}

export class Manager extends Employee {
  constructor(id: string, name: string, dateOfBirth: string, reportsTo: string) {
    super(id, name, dateOfBirth, 'Manager', reportsTo);
  }
}

export class Lead extends Employee {
  constructor(id: string, name: string, dateOfBirth: string, reportsTo: string) {
    super(id, name, dateOfBirth, 'Lead', reportsTo);
  }
}

export class Engineer extends Employee {
  constructor(id: string, name: string, dateOfBirth: string, reportsTo: string) {
    super(id, name, dateOfBirth, 'Engineer', reportsTo);
  }
}

// Factory Pattern to instantiate appropriate Employee instance
export class EmployeeFactory {
  public static createEmployee(data: EmployeeData): Employee {
    switch (data.designation) {
      case 'CEO':
        return new CEO(data.id, data.name, data.dateOfBirth);
      case 'Director':
        if (!data.reportsTo) throw new Error('Director must report to a CEO.');
        return new Director(data.id, data.name, data.dateOfBirth, data.reportsTo);
      case 'Manager':
        if (!data.reportsTo) throw new Error('Manager must report to a Director.');
        return new Manager(data.id, data.name, data.dateOfBirth, data.reportsTo);
      case 'Lead':
        if (!data.reportsTo) throw new Error('Lead must report to a Manager.');
        return new Lead(data.id, data.name, data.dateOfBirth, data.reportsTo);
      case 'Engineer':
        if (!data.reportsTo) throw new Error('Engineer must report to a Lead.');
        return new Engineer(data.id, data.name, data.dateOfBirth, data.reportsTo);
      default:
        throw new Error('Invalid designation.');
    }
  }
}

// Organization Manager Class handling business logic
export class OrganizationManager {
  private employees: Map<string, Employee> = new Map();

  // Create
  public addEmployee(data: EmployeeData): Employee {
    if (this.employees.has(data.id)) {
      throw new Error(`Employee with ID ${data.id} already exists.`);
    }

    // CEO validation
    if (data.designation === 'CEO') {
      const existingCEO = Array.from(this.employees.values()).find((emp) => emp.designation === 'CEO');
      if (existingCEO) {
        throw new Error(`Organization already has a CEO (${existingCEO.name}).`);
      }
    } else {
      // Validate Reporting Hierarchy
      if (!data.reportsTo) {
        throw new Error(`Designation ${data.designation} must report to a valid manager.`);
      }
      const manager = this.employees.get(data.reportsTo);
      if (!manager) {
        throw new Error(`Reporting manager with ID ${data.reportsTo} does not exist.`);
      }
      const expectedManagerDesignation = HIERARCHY_RULES[data.designation];
      if (manager.designation !== expectedManagerDesignation) {
        throw new Error(
          `Invalid hierarchy: A ${data.designation} must report to a ${expectedManagerDesignation}, but manager ${manager.id} is a ${manager.designation}.`
        );
      }
    }

    const newEmp = EmployeeFactory.createEmployee(data);
    this.employees.set(newEmp.id, newEmp);

    // Add to manager's reportees list
    if (newEmp.reportsTo) {
      const manager = this.employees.get(newEmp.reportsTo);
      manager?.reportees.push(newEmp.id);
    }

    return newEmp;
  }

  // Read Specific
  public getEmployee(id: string): Employee {
    const emp = this.employees.get(id);
    if (!emp) throw new Error(`Employee with ID ${id} not found.`);
    return emp;
  }

  // Read All
  public getAllEmployees(): Employee[] {
    return Array.from(this.employees.values());
  }

  // Update
  public updateEmployee(id: string, updates: Partial<Omit<EmployeeData, 'id' | 'designation'>>): Employee {
    const emp = this.getEmployee(id);

    if (updates.name !== undefined) {
      if (!updates.name.trim()) throw new Error('Name cannot be empty.');
      emp.name = updates.name;
    }

    if (updates.dateOfBirth !== undefined) {
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateRegex.test(updates.dateOfBirth)) {
        throw new Error('Invalid date format. Required: mm/dd/yyyy.');
      }
      emp.dateOfBirth = updates.dateOfBirth;
    }

    if (updates.reportsTo !== undefined && updates.reportsTo !== emp.reportsTo) {
      if (emp.designation === 'CEO') {
        throw new Error('CEO cannot report to anyone.');
      }
      const newManager = this.getEmployee(updates.reportsTo);
      const expectedDesignation = HIERARCHY_RULES[emp.designation];
      if (newManager.designation !== expectedDesignation) {
        throw new Error(
          `Invalid hierarchy: ${emp.designation} must report to a ${expectedDesignation}.`
        );
      }

      // Remove from old manager's reportees
      if (emp.reportsTo) {
        const oldManager = this.employees.get(emp.reportsTo);
        if (oldManager) {
          oldManager.reportees = oldManager.reportees.filter((rId) => rId !== id);
        }
      }

      // Reassign to new manager
      emp.reportsTo = updates.reportsTo;
      newManager.reportees.push(emp.id);
    }

    return emp;
  }

  // Delete
  public deleteEmployee(id: string): void {
    const emp = this.getEmployee(id);

    if (emp.reportees.length > 0) {
      throw new Error(
        `Cannot delete employee ${id} because they have active reportees (${emp.reportees.join(', ')}). Reassign or remove reportees first.`
      );
    }

    // Remove from manager's list
    if (emp.reportsTo) {
      const manager = this.employees.get(emp.reportsTo);
      if (manager) {
        manager.reportees = manager.reportees.filter((rId) => rId !== id);
      }
    }

    this.employees.delete(id);
  }
}