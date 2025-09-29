export default function DemoRedirect() {
  if (typeof window !== 'undefined') window.location.href = '/games';
  return null;
}
