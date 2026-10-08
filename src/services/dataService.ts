import { User } from '../types';
import { studentService } from './studentService';
import { placementService } from './placementService';
import { importBatchService } from './importBatchService';
import { apiClient } from './apiClient';

type Actor = Pick<User, 'id' | 'name' | 'email' | 'role'>;

export interface DeleteBatchResult {
  success: boolean;
  message: string;
  removedStudents?: number;
  removedApplications?: number;
}

export const dataService = {
  async cleanSlate(actor: Actor): Promise<{ success: boolean; message: string }> {
    if (actor.role !== 'tnp') {
      return {
        success: false,
        message: 'Only the T&P Officer can clear institution data.',
      };
    }

    await apiClient.cleanSlate();
    studentService.removeAll();
    placementService.clearAll();
    importBatchService.resetLocal();

    return {
      success: true,
      message: 'Student, import, drive, application, and notification data removed.',
    };
  },

  deleteImportBatch(
    batchId: string,
    actor: Actor
  ): DeleteBatchResult {
    const batch = importBatchService.getById(batchId);

    if (!batch) {
      return {
        success: false,
        message: 'That import no longer exists.',
      };
    }

    const isOwner = batch.uploadedById === actor.id;

    const allowed =
      (actor.role === 'faculty' && isOwner) ||
      actor.role === 'tnp';

    if (!allowed) {
      return {
        success: false,
        message:
          'You can only delete imports you are permitted to manage.',
      };
    }

    const removedStudents =
      studentService.deleteByBatch(batchId);

    importBatchService.remove(batchId);

    const removedApplications =
      placementService.deleteApplicationsForStudents(
        removedStudents.map((student) => student.Student_ID)
      );

    return {
      success: true,
      message:
        `Deleted "${batch.fileName}" (${batch.label}): ` +
        `${removedStudents.length} student record(s) and ` +
        `${removedApplications} application(s) removed.`,
      removedStudents: removedStudents.length,
      removedApplications,
    };
  },
};