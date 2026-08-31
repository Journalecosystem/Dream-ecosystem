import { addPerson, deletePerson } from "@/lib/actions/dreams";
import { Button } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/Field";
import type { DreamPerson } from "@/types/database";

export function PeopleSection({
  dreamId,
  people,
}: {
  dreamId: string;
  people: DreamPerson[];
}) {
  const addAction = addPerson.bind(null, dreamId);

  return (
    <div className="space-y-6">
      {people.length > 0 && (
        <ul className="space-y-4">
          {people.map((person) => {
            const removeAction = deletePerson.bind(null, dreamId, person.id);
            return (
              <li
                key={person.id}
                className="border border-line rounded-sm px-4 py-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-text">{person.name}</p>
                    {person.relationship_to_dreamer && (
                      <p className="text-sm text-text-muted">
                        {person.relationship_to_dreamer}
                      </p>
                    )}
                    {person.personal_significance && (
                      <p className="text-sm text-text-muted mt-1">
                        {person.personal_significance}
                      </p>
                    )}
                    <p className="text-xs text-text-muted mt-2">
                      {person.known_person ? "Known to you" : "Unknown"}
                      {person.appeared_before ? " · appeared before" : ""}
                    </p>
                  </div>
                  <form action={removeAction}>
                    <button className="text-xs text-text-muted hover:text-danger">
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form action={addAction} className="space-y-3 border-t border-line pt-5">
        <p className="text-sm text-text-muted">Add someone from the dream</p>
        <input type="text" name="name" placeholder="Name" required className={inputClasses} />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            name="relationship_to_dreamer"
            placeholder="Relationship to you, if any"
            className={inputClasses}
          />
          <input
            type="text"
            name="personal_significance"
            placeholder="What they represent to you"
            className={inputClasses}
          />
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="known_person" /> Known to you
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="appeared_before" /> Appeared in a previous dream
          </label>
        </div>
        <Button type="submit" variant="quiet">
          Add person
        </Button>
      </form>
    </div>
  );
}
