<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <q-input v-model="person.name" label="Name" />
        <q-select
          v-model="person.gender"
          :options="genderOptions"
          label="Gender"
        />
        <div class="row">
          <div class="col col-4">
            <q-select
              v-model="person.relationShip"
              :options="relationshipOptions"
              label="Relation"
            />
          </div>
          <div class="col col-8">
            <PersonSearchComponent></PersonSearchComponent>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Add" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style lang="sass" scoped></style>

<script setup>
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { PersonAddModel } from 'src/models/person-add-model';
import PersonSearchComponent from 'src/components/PersonSearchComponent.vue';

let person = ref(new PersonAddModel());
let genderOptions = ['Male', 'Female'];
let relationshipOptions = [
  'Father of',
  'Mother of',
  'Son of',
  'Daughter of',
  'Brother of',
  'Sister of',
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
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  console.log(person.value);
  onDialogOK();
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
