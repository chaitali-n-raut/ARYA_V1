import { ImportBatch } from '../types';
import { emitDataChange } from './dataEvents';
import { apiClient } from './apiClient';
class ImportBatchService {
  private batches:ImportBatch[]=[];
  public async load(){try{this.batches=await apiClient.importBatches();emitDataChange();}catch{this.batches=[];}}
  public getAll(){return this.batches;}
  public getById(id:string){return this.batches.find(b=>b.id===id)||null;}
  public create(input:{fileName:string;uploadedById:string;uploadedByName:string;recordCount:number;skippedCount:number;id?:string}):ImportBatch{const n=this.batches.length+1;const batch:any={id:input.id||`BATCH-${String(n).padStart(3,'0')}`,label:`Import Batch ${String(n).padStart(3,'0')}`,fileName:input.fileName,uploadedAt:new Date().toISOString(),uploadedById:input.uploadedById,uploadedByName:input.uploadedByName,recordCount:input.recordCount,skippedCount:input.skippedCount};this.batches.unshift(batch);emitDataChange();void apiClient.createImportBatch(batch).then(saved=>{const i=this.batches.findIndex(x=>x.id===batch.id);if(i>=0)this.batches[i]=saved;emitDataChange();}).catch(()=>{});return batch;}
  public peekNextId(){return `BATCH-${String(this.batches.length+1).padStart(3,'0')}`;}
  public updateCounts(id:string,recordCount:number,skippedCount:number){const b=this.getById(id);if(!b)return;b.recordCount=recordCount;b.skippedCount=skippedCount;emitDataChange();void apiClient.updateImportBatch(id,{recordCount,skippedCount}).catch(()=>{});}
  public remove(id:string){this.batches=this.batches.filter(b=>b.id!==id);emitDataChange();void apiClient.deleteImportBatch(id).then(()=>this.load()).catch(()=>{});}
  public clearAll(){this.batches=[];emitDataChange();void apiClient.clearImportBatches().then(()=>this.load()).catch(()=>{});}
  public resetLocal(){this.batches=[];emitDataChange();}
}
export const importBatchService=new ImportBatchService();
