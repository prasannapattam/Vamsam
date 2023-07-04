import { ref } from 'vue';
import familyData from 'src/services/family-data.json';

export default new (class Session {
  searchPersonId = ref<string>();
  familyData = familyData;
})();
