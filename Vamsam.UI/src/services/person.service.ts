import { PersonAddModel } from 'src/models/person-add-model';
import session from 'src/services/session';

export default new (class PersonService {
  savePerson(person: PersonAddModel) {
    const personId = (Math.floor(Math.random() * 100) + 1).toString();

    session.familyData = session.familyData.concat({
      id: personId,
      childId: personId,
      name: person.name,
      gender: person.gender,
      parentId: person.relatedPersonId,
      childOrder: 0,
    });

    session.searchPersonId.value = personId;
  }
})();
