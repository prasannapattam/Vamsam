<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin add-dialog">
      <q-card-section class="q-pa-sm flex-grow">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="basic" label="Basic Details" />
          <q-tab name="personal" label="Personal Details" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated dense>
          <q-tab-panel class="q-pa-sm" name="basic">
            <q-input v-model="person.name" dense label="Name" />
            <q-select
              dense
              v-model="person.gender"
              :options="genderOptions"
              label="Gender"
              emit-value
              map-options
            />
            <div class="row">
              <div class="col col-4">
                <q-select
                  dense
                  v-model="person.relationShip"
                  :options="relationshipOptions"
                  label="Relation"
                  emit-value
                  map-options
                />
              </div>
              <div class="col col-8">
                <PersonSearchComponent
                  v-model="person.relatedPersonId"
                  :global-search-ind="false"
                  label="Related Person"
                ></PersonSearchComponent>
              </div>
            </div>
            <q-input v-model="person.mobile" dense label="Mobile" />
          </q-tab-panel>

          <q-tab-panel name="alarms">
            <div class="text-h6">Alarms</div>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn dense color="primary" label="Add" @click="onOKClick" />
        <q-btn dense color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped>
.add-dialog
  min-height: 80vh
  display: flex
  flex-direction: column
.flex-grow
  flex-grow: 1
</style>

<script setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { PersonAddModel } from 'src/models/person-add-model';
import PersonSearchComponent from 'src/components/PersonSearchComponent.vue';
import PersonService from 'src/services/person.service';

const tab = ref('basic');
let person = ref(new PersonAddModel());
const genderOptions = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
];

const relationshipOptions = [
  { label: 'Father of', value: 'F' },
  { label: 'Mother of', value: 'M' },
  { label: 'Son of', value: 'S' },
  { label: 'Daughter of', value: 'D' },
  { label: 'Wife of', value: 'W' },
  { label: 'Husband of', value: 'H' },
  { label: 'Brother of', value: 'B' },
  { label: 'Sister of', value: 'S' },
];

const props = defineProps({
  // ...your custom props
});

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  PersonService.savePerson(person.value);
  // call onDialogOK (with optional payload)
  // or with payload: onDialogOK({ ... })
  onDialogOK();
}
</script>
