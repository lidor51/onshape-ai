import familyA from '../robots-a.json' with {type:'json'};
import familyB from '../robots-b.json' with {type:'json'};
import familyC from '../robots-c.json' with {type:'json'};
import familyD from '../robots-d.json' with {type:'json'};

export const robotCatalogue=[...familyA,...familyB,...familyC,...familyD];
export const taskLabels={
  stow:'Collapsed / stow intent',
  'coral-floor':'Coral / floor pickup',
  'coral-station':'Coral / station receive',
  'coral-l1':'Coral / L1 trough',
  'coral-l2':'Coral / L2 branch',
  'coral-l3':'Coral / L3 branch',
  'coral-l4':'Coral / L4 branch',
  'algae-floor':'Algae / floor pickup',
  'algae-low':'Algae / low reef removal',
  'algae-high':'Algae / high reef removal',
  processor:'Algae / processor delivery',
  net:'Algae / net',
  climb:'Cage / engagement study',
  park:'Barge / park intent',
};

export function tasksForRobot(id){
  const robot=robotCatalogue.find(candidate=>candidate.id===id);
  if(!robot)throw new Error(`Unknown robot ${id}`);
  const cap=robot.capabilities;
  return [
    'stow',
    ...cap.coralSources.map(source=>`coral-${source}`),
    ...cap.coralLevels.map(level=>`coral-l${level}`),
    ...cap.algaeSources.map(source=>({floor:'algae-floor',reefLow:'algae-low',reefHigh:'algae-high'}[source])),
    ...cap.algaeDestinations,
    cap.climb==='park'?'park':'climb',
  ];
}

export function assertSupportedTask(id,task){
  if(!tasksForRobot(id).includes(task))throw new Error(`${id} does not support ${task}`);
}