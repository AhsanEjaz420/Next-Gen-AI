import CaptionGenerator from '../tools/CaptionGenerator';

export default function ToolsView({ userCredits, onCreditsUpdate, userPlan }) {
  return <CaptionGenerator userCredits={userCredits} onCreditsUpdate={onCreditsUpdate} userPlan={userPlan} />;
}
