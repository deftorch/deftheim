import { Component } from "solid-js";
import { Card, CardContent } from "@components/common/Card";
import { Button } from "@components/common/Button";
import { Construction } from "lucide-solid";

// Generic placeholder component
const PagePlaceholder: Component<{ title: string; description: string }> = (props) => {
  return (
    <div class="p-6 h-full flex items-center justify-center">
      <Card variant="elevated" class="max-w-2xl w-full">
        <CardContent class="text-center py-12">
          <div class="mb-6 flex justify-center">
            <div class="w-20 h-20 rounded-full bg-[var(--color-background-tertiary)] flex items-center justify-center">
              <Construction size={40} class="text-[var(--color-text-secondary)]" />
            </div>
          </div>
          <h2 class="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {props.title}
          </h2>
          <p class="text-[var(--color-text-secondary)] mb-6">
            {props.description}
          </p>
          <div class="space-y-4 text-left bg-[var(--color-background-tertiary)] p-6 rounded-lg">
            <h3 class="font-semibold text-[var(--color-text-primary)]">
              Coming Soon:
            </h3>
            <ul class="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>✓ Full feature implementation</li>
              <li>✓ Beautiful UI with animations</li>
              <li>✓ Real-time updates</li>
              <li>✓ Seamless integration</li>
            </ul>
          </div>
          <Button variant="primary" class="mt-6" onClick={() => window.location.href = "/"}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagePlaceholder;