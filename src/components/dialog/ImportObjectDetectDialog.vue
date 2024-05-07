<script setup>
import { randomId } from "@/components/utils";
import { sleep } from "@/engine/helper";
import { useDatasetStore } from "@/store/dataset";
import { useWorkspaceStore } from "@/store/workspace";
import { toast } from "vue3-toastify";
import JSZip from "jszip";
import { useConfirm } from "@/components/comfirm-dialog";

const datasetStore = useDatasetStore();
const workspaceStore = useWorkspaceStore();
const confirm = useConfirm();

const props = defineProps({
  isDialogVisible: Boolean,
})

const emit = defineEmits(['update:isDialogVisible']);

const files = ref([]);
const xmlfiles = ref([]);
const kidBrightProjectZipFile = ref(null);

const step = ref(1); //1= select file , 2 = importing, 3 = import success
const progress = ref(0);
const percentage = ref(0);

const importImages = (e)=>{
  if(tab.value == "PASCAL_VOC"){
    importPascalVOC(e);
  }else if(tab.value == "KBAI"){
    importKidBrightProject(e);
  }else if(tab.value == "IMAGE"){
    importOnlyImage(e);
  }
};
const importOnlyImage = async(e)=>{
  if(step.value == 1){
    e.preventDefault();
    step.value = 2;
    let dataset = [];
    progress.value = 0;
    let labels = [];
    for(let file of files.value){
      let data = {
        id : randomId(16),
        image: file,
        annotate : [],
        class: null,
        ext : file.name.split(".").pop()
      };
      await datasetStore.addDataToFs(data);
      delete data.image;
      dataset.push(data);
      progress.value+=1;
      percentage.value= Math.round(progress.value/files.value.length*100);
    }
    step.value = 3;
    toast.success("นำเข้าข้อมูลสำเร็จ");
    datasetStore.addDatasetItems(dataset);
  }else if(step.value == 3){
    //import success 
  }
};

const importKidBrightProject = async(e)=>{  
  if(step.value == 1){
    e.preventDefault();
    step.value = 2;
    let dataset = [];
    progress.value = 0;
    let labels = [];
    let zipfiles = kidBrightProjectZipFile.value;
    if(zipfiles.length == 0){
      toast.error("กรุณาเลือกไฟล์ .zip ของโปรเจค KidBright AI IDE");
      return;
    }
    let targetFile = zipfiles[0];    
    let zipdata = await targetFile.arrayBuffer();
    let zip = new JSZip();
    let zipfilesInfo = await zip.loadAsync(zipdata);
    let files = Object.keys(zipfilesInfo.files).map(key=>zipfilesInfo.files[key]);
    let imageFiles = files.filter(f=>f.name.includes("raw_dataset/"));
    let projectFile = files.find(f=>f.name.includes("project.json"));
    let project = JSON.parse(await projectFile.async("text"));
    if(project?.project?.project?.extension?.id == "IMAGE_CLASSIFICATION"){
      try{
        await confirm({ title: "โปรเจคนี้เป็นโปรเจคประเภทการจำแนกรูปภาพ", content: `การนำเข้าจะทำได้เฉพาะรูปภาพอย่างเดียว`, dialogProps: { width: 'auto' } });
        let datasetFiles = project.dataset?.dataset?.data;
        if(!datasetFiles){
          toast.error("ไม่พบไฟล์รูปภาพในโปรเจค");
          return;
        }
        let dataset = [];
        progress.value = 0;
        let labels = [];
        for(let file of datasetFiles){
          let fileName = file.id + "." + file.ext;
          let imageFile = imageFiles.find(f=>f.name.includes(fileName));
          let data = {
            id : file.id,
            image: new Blob([await imageFile.async("blob")], {type: file.ext == "jpg" ? "image/jpeg" : "image/png"}),
            annotate : [],
            class: null,
            ext : file.ext
          };
          await datasetStore.addDataToFs(data);
          delete data.image;
          dataset.push(data);
          if (!labels.includes(file.class)) {
            labels.push(file.class);            
          }
          progress.value+=1;
          percentage.value= Math.round(progress.value/datasetFiles.length*100);
        }
        step.value = 3;
        toast.success("นำเข้าข้อมูลสำเร็จ");
        datasetStore.addDatasetItems(dataset);
        labels.forEach(label=>{
          workspaceStore.addLabel({label : label});
        });
      }catch(e){
        console.log(e);
        return;        
      }
    }else if(project?.project?.project?.extension?.id != "OBJECT_DETECTION"){
      toast.error("โปรเจคนี้ไม่ใช่โปรเจคที่ใช้ในการตรวจจับวัตถุ");
      return;
    }
    //import for object detection
    let datasetFiles = project.dataset?.dataset?.data;
    if(!datasetFiles){
      toast.error("ไม่พบไฟล์รูปภาพในโปรเจค");
      return;
    }
    let dataset2 = [];
    progress.value = 0;
    let labels2 = [];
    for(let file of datasetFiles){
      let fileName = file.id + "." + file.ext;
      let imageFile = imageFiles.find(f=>f.name.includes(fileName));
      let data = {
        id : file.id,
        image: new Blob([await imageFile.async("blob")], {type: file.ext == "jpg" ? "image/jpeg" : "image/png"}),
        annotate : file.annotate,
        class: null,
        ext : file.ext
      };
      await datasetStore.addDataToFs(data);
      delete data.image;
      dataset2.push(data);
      file.annotate.forEach(anno=>{
        if (!labels2.includes(anno.label)) {
          labels2.push(anno.label);            
        }
      });
      progress.value+=1;
      percentage.value= Math.round(progress.value/datasetFiles.length*100);
    }
    step.value = 3;
    toast.success("นำเข้าข้อมูลสำเร็จ");
    datasetStore.addDatasetItems(dataset2);
    labels2.forEach(label=>{
      workspaceStore.addLabel({label : label});
    });

  }else if(step.value == 3){
    //import success 
  }
};
const importPascalVOC = async(e)=>{
  console.log("voc import");
  //check image and xml files match 
  if(files.value.length != xmlfiles.value.length){
    toast.error("จำนวนไฟล์รูปภาพ และไฟล์ XML Annotation ไม่ตรงกัน");
    return;
  }
  if(step.value == 1){
    e.preventDefault();
    step.value = 2;
    let dataset = [];
    progress.value = 0;
    let labels = [];
    for(let xmlfile of xmlfiles.value){
      let file = files.value.find(f=>f.name.split(".").shift() == xmlfile.name.split(".").shift());
      if(!file){
        //toast.error("ไม่พบไฟล์รูปภาพที่สอดคล้องกับไฟล์ XML Annotation");
        return;
      }
      //read annotation
      let xml = await xmlfile.text();
      let parser = new DOMParser();
      let xmlDoc = parser.parseFromString(xml,"text/xml");
      let objects = xmlDoc.getElementsByTagName("object");
      let object = {
        filename : xmlDoc.getElementsByTagName("filename")[0].childNodes[0].nodeValue,
        width : xmlDoc.getElementsByTagName("width")[0].childNodes[0].nodeValue,
        height : xmlDoc.getElementsByTagName("height")[0].childNodes[0].nodeValue,
        annotate : []
      }      
      for(let obj of objects){
        let name = obj.getElementsByTagName("name")[0].childNodes[0].nodeValue;
        let bndbox = obj.getElementsByTagName("bndbox")[0];
        let xmin = bndbox.getElementsByTagName("xmin")[0].childNodes[0].nodeValue;
        let ymin = bndbox.getElementsByTagName("ymin")[0].childNodes[0].nodeValue;
        let xmax = bndbox.getElementsByTagName("xmax")[0].childNodes[0].nodeValue;
        let ymax = bndbox.getElementsByTagName("ymax")[0].childNodes[0].nodeValue;
        let id = randomId(16);
        object.annotate.push({
          id : id,
          label : name,
          x1 : parseInt(xmin),
          y1 : parseInt(ymin),
          x2 : parseInt(xmax),
          y2 : parseInt(ymax)
        });
        //check label exist in label list
        if(!labels.includes(name)){
          labels.push(name);
          workspaceStore.addLabel({label : name});
        }
      } 
      // add image and annotation to dataset
      let data = {
        id : randomId(16),        
        image: file,        
        annotate : object.annotate,
        width : parseInt(object.width),
        height : parseInt(object.height),
        class: null,        
        ext : file.name.split(".").pop()
      };
      await datasetStore.addDataToFs(data);      
      delete data.image;
      dataset.push(data);
      progress.value+=1;
      percentage.value= Math.round(progress.value/files.value.length*100);
      //await this.delay(100);
    }
    step.value = 3;
    toast.success("นำเข้าข้อมูลสำเร็จ");
    datasetStore.addDatasetItems(dataset);
    labels.forEach(label=>{
      workspaceStore.addLabel({label : label});
    });
  }else if(step.value == 3){
    //import success 
  }
};
const resetAndClose = (e)=>{
  files.value = [];
  //importWithLabel.value = false;
  step.value = 1;
  progress.value = 0;
  emit('update:isDialogVisible', false);
  return;
}
const tab = ref("PASCAL VOL");
</script>

<template>
  <VDialog :model-value="props.isDialogVisible" width="auto" persistent>
    <VCard width="480">
      <VCardTitle class="bg-primary d-flex flex-row">
        นำเข้ารูปภาพ
        <VSpacer></VSpacer>
        <VBtn density="compact" icon="mdi-close" @click="resetAndClose"></VBtn>
      </VCardTitle>
      <VCardItem v-if="step == 1">        
        <VRow>
          <VCol cols="12" class="d-flex justify-center my-2">
            <img src="@/assets/images/png/khanomchan-import.png" height="200"/>
          </VCol>  
          <VCol cols="12">
            <VTabs v-model="tab" grow>
              <VTab value="IMAGE">
                <span>IMPORT IMAGE</span>
              </VTab>
              <VTab value="PASCAL_VOC">
                <span>PASCAL VOC</span>
              </VTab>
              <VTab value="KBAI" style="text-transform: none !important;">
                <span>KidBright AI</span> 
              </VTab>
            </VTabs>
            <VWindow v-model="tab">
              <VWindowItem value="IMAGE" class="pt-5">
                <VRow>
                  <VCol cols="12" class="text-center">     
                    <span class="text-title px-2 w-100">นำเข้าเฉพาะรูปภาพ</span>
                  </VCol>
                  <VCol cols="12">                    
                    <VFileInput
                      v-model="files"
                      color="primary"
                      label="เลือก Folder รูปภาพ"
                      multiple
                      density="compact"
                      hide-details
                      counter
                      webkitdirectory
                      directory
                      :show-size="1024"
                    >
                    <template v-slot:selection="{ fileNames }">
                      <template v-for="(fileName, index) in fileNames" :key="fileName">
                        <VChip v-if="index < 3" color="primary" label size="small" class="me-2">
                          {{ fileName }}
                        </VChip>
                        <span v-else-if="index === 3" class="text-overline text-grey-darken-3 mx-2">
                          +{{ files.length - 3 }} File(s)
                        </span>
                      </template>
                    </template>
                    </VFileInput>
                  </VCol>
                </VRow>
              </VWindowItem>
              <VWindowItem value="PASCAL_VOC" class="pt-5">
                <VRow>
                  <VCol cols="12">                    
                    <VFileInput
                      v-model="files"
                      color="primary"
                      label="เลือก Folder รูปภาพ"
                      multiple
                      density="compact"
                      hide-details
                      counter
                      webkitdirectory
                      directory
                      :show-size="1024"
                    >
                    <template v-slot:selection="{ fileNames }">
                      <template v-for="(fileName, index) in fileNames" :key="fileName">
                        <VChip v-if="index < 3" color="primary" label size="small" class="me-2">
                          {{ fileName }}
                        </VChip>
                        <span v-else-if="index === 3" class="text-overline text-grey-darken-3 mx-2">
                          +{{ files.length - 3 }} File(s)
                        </span>
                      </template>
                    </template>
                    </VFileInput>
                  </VCol>
                  <VCol cols="12">
                    <VFileInput
                      v-model="xmlfiles"
                      color="primary"
                      label="เลือก Folder XML Annotation"
                      multiple
                      density="compact"
                      counter
                      hide-details
                      webkitdirectory
                      directory
                      :show-size="1024"
                    >
                      <template v-slot:selection="{ fileNames }">
                        <template v-for="(fileName, index) in fileNames" :key="fileName">
                          <VChip v-if="index < 3" color="primary" label size="small" class="me-2">
                            {{ fileName }}
                          </VChip>
                          <span v-else-if="index === 3" class="text-overline text-grey-darken-3 mx-2">
                            +{{ files.length - 3 }} File(s)
                          </span>
                        </template>
                      </template>
                      </VFileInput>
                  </VCol>                  
                  <VCol cols="12">                    
                    <img class="ps-5" src="@/assets/images/png/import_note_anno.png" height="100"/>
                  </VCol>                
                </VRow>
              </VWindowItem>
              <VWindowItem value="KBAI" class="pt-5">
                <VRow>
                  <VCol cols="12" class="text-center">     
                    <span class="text-title px-2 w-100">นำเข้า Dataset จากโปรเจค KidBright AI IDE</span>
                  </VCol>
                  <VCol cols="12">
                    <VFileInput
                      v-model="kidBrightProjectZipFile"
                      label="เลือกไฟล์ .zip ของโปรเจค KidBright AI IDE"
                      density="compact"                      
                      hide-details
                      color="primary"
                      accept=".zip"
                    ></VFileInput>
                  </VCol>
                </VRow>
              </VWindowItem>
            </VWindow>
          </VCol>          
        </VRow>
      </VCardItem>
      <VCardItem class="d-flex align-center justify-center" v-if="step >= 2">
        <VProgressCircular
          :rotate="360"
          :size="200"
          :width="30"
          :model-value="percentage"
          color="primary"
        >
          <h4 v-if="step == 2" class="my-3 text-center" text-black>กำลังนำเข้า ...<br/> {{progress}} / {{files.length || ""}}</h4>
          <h4 v-else-if="step == 3" class="my-3" text-black>นำเข้าสำเร็จ</h4>
        </VProgressCircular>
      </VCardItem>
      <VCardActions>
        <VSpacer></VSpacer>
        <VBtn color="secondary" variant="flat" @click="resetAndClose" v-if="step == 1">ยกเลิก</VBtn>
        <VBtn color="primary" variant="flat" @click="importImages" v-if="step == 1">นำเข้า</VBtn>
        <VBtn color="primary" variant="flat" @click="resetAndClose" v-if="step == 3">ปิด</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
