import { membershipContent } from "@/data/membershipPageContent.js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MembershipFaqAccordion() {
  const { faq } = membershipContent;

  return (
    <Accordion type="single" collapsible className="w-full text-left">
      {faq.map((item, index) => (
        <AccordionItem key={item.q} value={`faq-${index}`}>
          <AccordionTrigger>{item.q}</AccordionTrigger>
          <AccordionContent>
            <p>{item.a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
