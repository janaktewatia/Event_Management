import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ArrowLeft, Check } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks";
import { getTheme, setTheme, THEMES, ThemeType } from "@/lib/theme-store";
import { useState, useEffect } from "react";

const MODULE_META: Record<string, { title: string; description: string }> = {
  events: { title: "Event Manager", description: "Create, schedule and track events end-to-end." },
  "events-dashboard": { title: "Dashboard", description: "Event management overview and metrics." },
  "events-create": { title: "Create Event", description: "Create a new event and configure details." },
  "events-registrants": { title: "Registrants", description: "Manage event registrations and attendees." },
  "events-scan": { title: "Scan Pass", description: "Scan and verify event passes." },
  "events-attendees": { title: "Attendee Data", description: "View and manage attendee information." },
  "events-qr-gen": { title: "Generate QR Code", description: "Generate individual QR codes for passes." },
  "events-bulk-qr": { title: "Bulk QR Codes", description: "Generate QR codes in bulk." },
  "events-setup": { title: "Setup", description: "Configure event settings and parameters." },
  "events-comm-setup": { title: "Communication Setup", description: "Set up communication channels for events." },
  "events-comm-templates": { title: "Communication Templates", description: "Manage communication templates." },
  "events-whatsapp": { title: "WhatsApp Integration", description: "Integrate WhatsApp for event communications." },
  whatsapp: { title: "WhatsApp CRM", description: "Conversations, broadcasts and automations on WhatsApp." },
  website: { title: "Website Builder", description: "Drag-and-drop pages, forms and landing experiences." },
  users: { title: "User Management", description: "Roles, permissions and team access." },
  communication: { title: "Communication", description: "Announcements, email and SMS campaigns." },
  "front-office": { title: "Front Office", description: "Check-ins, visitors and reception desk." },
  reports: { title: "Reports & Analytics", description: "Cross-module reporting and insights." },
  settings: { title: "Configuration", description: "Workspace, billing and integrations." },
  configuration: { title: "Configuration", description: "Workspace, billing and general settings." },
  "integrations-whatsapp": { title: "WhatsApp Integration", description: "Connect Meta Cloud API or BSP vendor for WhatsApp." },
  "integrations-email": { title: "Email Integration", description: "Connect SMTP, SendGrid or other email providers." },
  "integrations-sms": { title: "SMS Integration", description: "Connect SMS gateways like Twilio, MSG91 or Kaleyra." },
  "integrations-facebook": { title: "Facebook Integration", description: "Connect Facebook Pages, Ads and Lead forms." },
  "integrations-other": { title: "Other API Integration", description: "Connect custom REST APIs and webhooks." },
};

export const Route = createFileRoute("/modules/$module")({
  head: ({ params }) => {
    const m = MODULE_META[params.module];
    return {
      meta: [
        { title: `${m?.title ?? "Module"} — OrbitOps` },
        { name: "description", content: m?.description ?? "OrbitOps module" },
      ],
    };
  },
  component: ModulePage,
});

function ModulePage() {
  const { module } = Route.useParams();
  const meta = MODULE_META[module] ?? { title: module, description: "Module" };
  const url = `/modules/${module}`;
  const { add, remove, has } = useBookmarks();
  const pinned = has(url);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(getTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const theme = getTheme();
    setCurrentTheme(theme);
  }, []);

  // Handle Event Manager sub-modules
  const isEventManagerModule = module.startsWith("events-");
  const isConfigurationModule = module === "configuration";

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">{meta.title}</h1>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Button
          variant={pinned ? "secondary" : "outline"}
          onClick={() => (pinned ? remove(url) : add({ title: meta.title, url }))}
        >
          {pinned ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {pinned ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>

      {isConfigurationModule && mounted ? (
        <>
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Customize your workspace appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Theme</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a theme to customize the appearance of the application
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                  {Object.entries(THEMES).map(([themeId, theme]) => (
                    <button
                      key={themeId}
                      onClick={() => {
                        setCurrentTheme(themeId as ThemeType);
                        setTheme(themeId as ThemeType);
                      }}
                      className="relative rounded-lg border-2 p-4 text-left transition-all hover:border-primary"
                      style={{
                        borderColor: currentTheme === themeId ? theme.colors.primary : "#e2e8f0",
                        backgroundColor: currentTheme === themeId ? `${theme.colors.primary}10` : "transparent",
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{theme.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
                        </div>
                        {currentTheme === themeId && (
                          <Check className="h-5 w-5 ml-2" style={{ color: theme.colors.primary }} />
                        )}
                      </div>
                      {/* Color preview */}
                      <div className="flex gap-2 mt-3">
                        <div
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: theme.colors.primary }}
                          title="Primary color"
                        />
                        <div
                          className="w-8 h-8 rounded border"
                          style={{
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.foreground,
                          }}
                          title="Background color"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* More settings can be added here */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                OrbitOps Workspace v1.0 - All your modules, one dashboard
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEventManagerModule ? "Feature Available" : "Coming soon"}
            </CardTitle>
            <CardDescription>
              {isEventManagerModule
                ? `${meta.title} from QRCodeGenerator is now integrated. This feature is powered by our Event Management system.`
                : `This is a placeholder for the ${meta.title} module. We can build it out next.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEventManagerModule && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4 bg-muted/30">
                    <div className="h-3 w-20 bg-muted rounded mb-3" />
                    <div className="h-6 w-32 bg-muted rounded mb-2" />
                    <div className="h-3 w-full bg-muted rounded" />
                  </div>
                ))}
              </div>
            )}
            {isEventManagerModule && (
              <div className="rounded-lg border p-6 bg-blue-50">
                <p className="text-sm text-blue-900">
                  ✓ {meta.title} is fully integrated and ready to use from the QRCodeGenerator application.
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  Module: {module}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
