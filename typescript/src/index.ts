import { OrganizationManager } from './organization';

const org = new OrganizationManager();

console.log('--- 1. ADDING EMPLOYEES (HAPPY PATH) ---');
try {
  org.addEmployee({ id: 'E001', name: 'Alice Smith', dateOfBirth: '01/15/1980', designation: 'CEO' });
  org.addEmployee({ id: 'E002', name: 'Bob Jones', dateOfBirth: '05/20/1985', designation: 'Director', reportsTo: 'E001' });
  org.addEmployee({ id: 'E003', name: 'Charlie Brown', dateOfBirth: '08/12/1990', designation: 'Manager', reportsTo: 'E002' });
  org.addEmployee({ id: 'E004', name: 'Diana Prince', dateOfBirth: '11/02/1993', designation: 'Lead', reportsTo: 'E003' });
  org.addEmployee({ id: 'E005', name: 'Evan Wright', dateOfBirth: '03/30/1998', designation: 'Engineer', reportsTo: 'E004' });

  console.log('All employees added successfully!');
  org.getAllEmployees().forEach((e) => console.log(e.getDetails()));
} catch (error: any) {
  console.error('Error:', error.message);
}

console.log('\n--- 2. EDGE CASE VALIDATIONS ---');

// Attempting duplicate ID
try {
  org.addEmployee({ id: 'E001', name: 'Duplicate CEO', dateOfBirth: '01/01/1990', designation: 'CEO' });
} catch (error: any) {
  console.log('[Handled Expected Error]:', error.message);
}

// Attempting second CEO
try {
  org.addEmployee({ id: 'E006', name: 'Second CEO', dateOfBirth: '01/01/1990', designation: 'CEO' });
} catch (error: any) {
  console.log('[Handled Expected Error]:', error.message);
}

// Invalid reporting hierarchy (Engineer reporting directly to Director)
try {
  org.addEmployee({ id: 'E007', name: 'Rogue Engineer', dateOfBirth: '02/02/1995', designation: 'Engineer', reportsTo: 'E002' });
} catch (error: any) {
  console.log('[Handled Expected Error]:', error.message);
}

// Invalid date format
try {
  org.addEmployee({ id: 'E008', name: 'Bad Date', dateOfBirth: '1995-02-02', designation: 'Lead', reportsTo: 'E003' });
} catch (error: any) {
  console.log('[Handled Expected Error]:', error.message);
}

console.log('\n--- 3. DELETION EDGE CASE (HAS REPORTEES) ---');
try {
  org.deleteEmployee('E004'); // E004 (Lead) has E005 (Engineer) reporting
} catch (error: any) {
  console.log('[Handled Expected Error]:', error.message);
}

console.log('\n--- 4. SUCCESSFUL DELETION & UPDATE ---');
try {
  // Delete leaf node employee (Engineer)
  org.deleteEmployee('E005');
  console.log('Deleted Engineer E005 successfully.');

  // Now delete Lead E004
  org.deleteEmployee('E004');
  console.log('Deleted Lead E004 successfully.');

  // Update Manager E003
  org.updateEmployee('E003', { name: 'Charlie B. Updated' });
  console.log('Updated E003:', org.getEmployee('E003').getDetails());
} catch (error: any) {
  console.error('Error:', error.message);
}