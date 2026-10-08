import { StudentRecord, User } from '../types';
import { emitDataChange } from './dataEvents';
import { apiClient } from './apiClient';

export const RAW_DEFAULT_STUDENT: StudentRecord = {
  Student_ID:'', Full_Name:'', Email:'', Phone:'', College:'', Department:'Computer Science and Engineering', Branch:'Computer Science & Engineering', Year:4, Section:'A', Graduation_Year:new Date().getFullYear()+1,
  CGPA:0, Attendance_Percentage:0, Backlogs:0, Technical_Skills:[], Certifications:[], Internships:[], Projects:[], Coding_Activity:{platform:'LeetCode',problemsSolved:0,contestRating:0,leetcodeSolved:0,leetcodeRating:0,codechefSolved:0,codechefRating:0}, Aptitude_Score:0, Communication_Score:0, Class_Teacher:'', Mentor:'', Location:'', Target_Role:'', Bio:'', Mentorship_Notes:[], isProfileCompleted:false, ResumeUploaded:false, UpdatedAt:new Date().toISOString()
};
export const INITIAL_STUDENTS: StudentRecord[]=[];
export const SAMPLE_COHORT: StudentRecord[]=[];

class StudentService {
  private students: StudentRecord[]=[];
  public async load(): Promise<void> { try { this.students=await apiClient.students(); emitDataChange(); } catch { this.students=[]; } }
  public getAllStudents(){ return this.students; }
  public getStudentById(id:string){ const key=id.trim().toUpperCase(); return this.students.find(s=>s.Student_ID.toUpperCase()===key)||null; }
  public createRawStudent(studentId:string,fullName:string,email:string,department?:string):StudentRecord {
    const existing=this.getStudentById(studentId); if(existing)return existing;
    const raw={...RAW_DEFAULT_STUDENT,Student_ID:studentId.toUpperCase(),Full_Name:fullName,Email:email,Department:department||RAW_DEFAULT_STUDENT.Department,Branch:department||RAW_DEFAULT_STUDENT.Branch,UpdatedAt:new Date().toISOString()};
    this.students.push(raw); emitDataChange(); void apiClient.createStudent(raw).then(s=>{const i=this.students.findIndex(x=>x.Student_ID===raw.Student_ID);if(i>=0)this.students[i]=s;emitDataChange();}).catch(()=>{}); return raw;
  }
  public updateStudent(updated:StudentRecord):boolean { const row={...updated,UpdatedAt:new Date().toISOString()};const i=this.students.findIndex(s=>s.Student_ID.toUpperCase()===row.Student_ID.toUpperCase());if(i>=0)this.students[i]=row;else this.students.push(row);emitDataChange();void apiClient.saveStudent(row).then(saved=>{const j=this.students.findIndex(s=>s.Student_ID.toUpperCase()===saved.Student_ID.toUpperCase());if(j>=0)this.students[j]=saved;emitDataChange();}).catch(()=>{});return true; }
  public importBatch(records:StudentRecord[],batchId:string,uploader:Pick<User,'name'|'email'>):{added:number;skippedIds:string[]} { const existing=new Set(this.students.map(s=>s.Student_ID.toUpperCase()));const skipped:string[]=[];const rows:StudentRecord[]=[];for(const rec of records){const sid=rec.Student_ID.toUpperCase();if(existing.has(sid)){skipped.push(sid);continue;}existing.add(sid);rows.push({...rec,Student_ID:sid,Mentor:rec.Mentor?.trim()?rec.Mentor:uploader.name,Mentor_Email:rec.Mentor?.trim()?rec.Mentor_Email:rec.Mentor_Email||uploader.email,Import_Batch_ID:batchId,UpdatedAt:new Date().toISOString()});}if(rows.length)this.students.push(...rows);emitDataChange();void apiClient.bulkStudents(rows,batchId).then(r=>{this.students=this.students.filter(s=>!rows.some(x=>x.Student_ID===s.Student_ID));this.students.push(...(r.students||rows));emitDataChange();}).catch(()=>{});return{added:rows.length,skippedIds:skipped}; }
  public deleteByBatch(batchId:string){const removed=this.students.filter(s=>s.Import_Batch_ID===batchId);this.students=this.students.filter(s=>s.Import_Batch_ID!==batchId);emitDataChange();void apiClient.deleteImportBatch(batchId).then(()=>this.load()).catch(()=>{});return removed;}
  public countByBatch(batchId:string){return this.students.filter(s=>s.Import_Batch_ID===batchId).length;}
  public isAssignedTo(student:StudentRecord,mentor:Pick<User,'name'|'email'>){const e=(mentor.email||'').trim().toLowerCase(),n=(mentor.name||'').trim().toLowerCase();return (!!student.Mentor_Email&&student.Mentor_Email.toLowerCase()===e)||((student.Mentor||'').trim().toLowerCase()===n);}
  public getStudentsForMentor(mentor:Pick<User,'name'|'email'>){return this.students.filter(s=>this.isAssignedTo(s,mentor));}
  public assignMentor(id:string,name:string,email?:string){const s=this.getStudentById(id);if(!s)return false;Object.assign(s,{Mentor:name,Mentor_Email:email||'',UpdatedAt:new Date().toISOString()});emitDataChange();void apiClient.assignMentor(id,name,email||'').then(saved=>{const i=this.students.findIndex(x=>x.Student_ID===saved.Student_ID);if(i>=0)this.students[i]=saved;emitDataChange();}).catch(()=>{});return true;}
  public addMentoringNote(id:string,note:string){const s=this.getStudentById(id);if(!s)return false;this.updateStudent({...s,Mentorship_Notes:[`${new Date().toISOString().split('T')[0]}: ${note}`,...(s.Mentorship_Notes||[])]});void apiClient.addMentoringNote(id,note).then(saved=>{const i=this.students.findIndex(x=>x.Student_ID===saved.Student_ID);if(i>=0)this.students[i]=saved;emitDataChange();}).catch(()=>{});return true;}
  public resetToDefault(){this.removeAll();}
  public removeAll(){this.students=[];emitDataChange();}
}
export const studentService=new StudentService();
