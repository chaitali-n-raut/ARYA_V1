import { User } from '../types';
import { studentService } from './studentService';
import { placementService } from './placementService';
import { importBatchService } from './importBatchService';
import { authService } from './authService';
import { emitDataChange } from './dataEvents';

type Actor = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface DeleteBatchResult {
  success: boolean;
  message: string;
  removedStudents?: number;
  removedApplications?: number;
}

/** Re-creates an EMPTY profile for registered student accounts so they can still log in. */
function restoreProfilesForAccounts(studentIds?: string[]): void {
  const filter = studentIds ? new Set(studentIds.map((i) => i.toUpperCase())) : null;
  authService
    .getRegisteredUsers()
    .filter((u) => u.role === 'student' && u.studentId && (!filter || filter.has(u.studentId.toUpperCase())))
    .forEach((u) => {
      studentService.createRawStudent(u.studentId!, u.name, u.email, u.department);
    });
}

export const dataService = {
  /**
   * START WITH CLEAN SLATE
   * Removes: student records, import batches, placement drives, applications, notifications.
   * Keeps:   user accounts, roles, passwords, the logged-in session, app configuration.
   * Registered student accounts get a fresh, empty profile so they are not locked out.
   */
  cleanSlate(actor: Actor): { success: boolean; message: string } {
    if (actor.role !== 'tnp' && actor.role !== 'admin') {
      return { success: false, message: 'Permission denied: only the T&P Officer or Admin can reset application data.' };
    }
    studentService.removeAll();
    importBatchService.clearAll();
    placementService.clearAll();
    restoreProfilesForAccounts();
    emitDataChange();
    return { success: true, message: 'Clean slate applied. All student, drive, application and import records were removed. User accounts and roles were kept.' };
  },

  /**
   * Deletes ONE import batch: only students carrying that batch id are removed
   * (plus the placement applications those students submitted). Other batches are untouched.
   */
  deleteImportBatch(batchId: string, actor: Actor): DeleteBatchResult {
    const batch = importBatchService.getById(batchId);
    if (!batch) return { success: false, message: 'That import no longer exists.' };

    const isOwner = batch.uploadedById === actor.id;
    if (!(actor.role === 'admin' || (actor.role === 'faculty' && isOwner))) {
      return { success: false, message: 'You can only delete CSV imports that you uploaded.' };
    }

    const removed = studentService.deleteByBatch(batchId);
    const removedIds = removed.map((s) => s.Student_ID);
    const removedApplications = placementService.deleteApplicationsForStudents(removedIds);
    importBatchService.remove(batchId);
    restoreProfilesForAccounts(removedIds);
    emitDataChange();

    return {
      success: true,
      message: `Deleted "${batch.fileName}" (${batch.label}): ${removed.length} student record(s) and ${removedApplications} application(s) removed.`,
      removedStudents: removed.length,
      removedApplications
    };
  }
};
