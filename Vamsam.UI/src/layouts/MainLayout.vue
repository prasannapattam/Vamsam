<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title shrink> Vamsam </q-toolbar-title>
        <q-space></q-space>
        <PersonSearchComponent
          @selected="personSelected"
        ></PersonSearchComponent>
        <q-space></q-space>
        <q-chip>
          <q-avatar color="blue" text-color="white">
            <img :src="maleIcon" />
          </q-avatar>
          Prasanna Kumar
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" :show-if-above="false" bordered>
      <q-list>
        <q-item-label header> Menu Goes here </q-item-label>

        <!-- <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        /> -->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="accent" @click="personAdd" />
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<!-- <style lang="sass">
.q-field__label
  color: white
</style> -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import maleIcon from 'src/assets/images/male.svg';
import femaleIcon from 'src/assets/images/female.svg';
import { useQuasar } from 'quasar';
import session from 'src/services/session';
import PersonSearchComponent from 'src/components/PersonSearchComponent.vue';
import PersonAddDialog from 'src/components/PersonAddDialog.vue';

// import EssentialLink, {
//   EssentialLinkProps,
// } from 'components/EssentialLink.vue';

// const essentialLinks: EssentialLinkProps[] = [
//   {
//     title: 'Docs',
//     caption: 'quasar.dev',
//     icon: 'school',
//     link: 'https://quasar.dev',
//   },
//   {
//     title: 'Github',
//     caption: 'github.com/quasarframework',
//     icon: 'code',
//     link: 'https://github.com/quasarframework',
//   },
//   {
//     title: 'Discord Chat Channel',
//     caption: 'chat.quasar.dev',
//     icon: 'chat',
//     link: 'https://chat.quasar.dev',
//   },
// ];

const leftDrawerOpen = ref(false);
const $q = useQuasar();

onMounted(() => {
  //console.log(personSearchSelect.value.$refs);
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function personSelected(personId: string) {
  session.searchPersonId.value = personId;
}

function personAdd() {
  $q.dialog({
    component: PersonAddDialog,

    // props forwarded to your custom component
    componentProps: {
      persistent: true,
      // text: 'something',
      // ...more..props...
    },
  })
    .onOk(() => {
      console.log('OK');
    })
    .onCancel(() => {
      console.log('Cancel');
    })
    .onDismiss(() => {
      console.log('Called on OK or Cancel');
    });
}
</script>
