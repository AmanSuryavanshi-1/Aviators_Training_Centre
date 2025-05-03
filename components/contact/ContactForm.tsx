"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/components/ui/utils";
import { Send } from "lucide-react";
import { app } from "@/lib/firebase";
import { getDatabase, ref, push, serverTimestamp } from "firebase/database";

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  readOnly = false,
  className,
}) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className={cn("focus-visible:ring-teal-500", className)}
        />
      ) : (
        <Input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className={cn("focus-visible:ring-teal-500", className)}
        />
      )}
    </div>
  );
};

interface SubmitButtonProps {
  title: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ title }) => {
  return <Button type="submit">{title}</Button>;
};

const inquirySubjects = [
  "General Inquiry",
  "CPL Ground Classes (All Subjects)",
  "ATPL Ground Classes (All Subjects)",
  "Air Navigation Course",
  "Aviation Meteorology Course",
  "Air Regulations Course",
  "Technical General Course",
  "Technical Specific Course",
  "RTR(A) Training",
  "A320/B737 Type Rating Prep",
  "Airline Interview Preparation",
  "One-on-One Classes Inquiry",
  "Batch Schedule Inquiry",
  "Fee Structure Inquiry",
  "Other",
];

const ContactForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isDemoBooking, setIsDemoBooking] = useState(false);
  const defaultDemoMessage = `I would like to book a demo. Please contact me to schedule a time.`;

  useEffect(() => {
    if (window.location.hash === "#contact-form") {
      window.location.hash = "";
      window.location.hash = "#contact-form";
    }
    const params = new URLSearchParams(window.location.search);
    const subjectFromUrl = params.get("subject");
    const courseName = params.get("courseName");
    const nameFromUrl = params.get("name");
    const messageFromUrl = params.get("message");

    if (nameFromUrl) {
      setName(nameFromUrl);
    }
    if (subjectFromUrl) {
      setSubject(subjectFromUrl);
      setMessage(
        isDemoBooking
          ? `I would like to book a demo${
              courseName ? ` for the ${courseName} course` : ""
            }. Please contact me to schedule a time.`
          : String(messageFromUrl || "")
      );
      setIsDemoBooking(true);
    }
  }, [isDemoBooking, defaultDemoMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDemoBooking && !subject) {
      toast({
        title: "Subject Required",
        description: "Please select a subject for your inquiry.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    // --
      const formData = { name, email, phone, subject, message };
      const db = getDatabase(app);
      const contactsRef = ref(db, "contacts");
    
      console.log("Submitting form data:", formData); // Log form data
    
      try {
        console.log("Before pushing to Firebase");
      // --
    const db = getDatabase(app);
    const contactsRef = ref(db, "contacts");
    // const formData = {
    //   name,
    //   email,
    //   phone,
    //   subject,
    //   message,
    // };
    try {
      const newContactRef = await push(contactsRef, {
        ...formData,
        timestamp: serverTimestamp(),
      });
      const mailerSendApiKey = process.env.MAILERSEND_API_KEY;
      const userConfirmationTemplateId =
        process.env.USER_CONFIRMATION_TEMPLATE_ID;
      const ownerNotificationTemplateId =
        process.env.OWNER_NOTIFICATION_TEMPLATE_ID;
      const fromEmail = process.env.FROM_EMAIL;
      const owner1Email = "adude890@gmail.com";
      const owner2Email = "aviatorstrainingcentre@gmail.com";
      const mailerSendApiUrl = "https://api.mailersend.com/v1/email";
      const userEmailData = {
        from: {
          email: fromEmail,
        },
        to: [
          {
            email: email,
          },
        ],
        template_id: userConfirmationTemplateId,
        variables: [
          {
            email: email,
            substitutions: [
              {
                var: "name",
                value: name,
              },
              {
                var: "subject",
                value: subject,
              },
            ],
          },
        ],
      };
      const ownerEmailData = {
        from: {
          email: fromEmail,
        },
        to: [
          {
            email: owner1Email,
          },
          {
            email: owner2Email,
          },
        ],
        template_id: ownerNotificationTemplateId,
        variables: [
          {
            email: owner1Email,
            substitutions: [
              {
                var: "name",
                value: name,
              },
              {
                var: "email",
                value: email,
              },
              {
                var: "phone",
                value: phone,
              },
              {
                var: "subject",
                value: subject,
              },
              {
                var: "message",
                value: message,
              },
            ],
          },
          {
            email: owner2Email,
            substitutions: [
              {
                var: "name",
                value: name,
              },
              {
                var: "email",
                value: email,
              },
              {
                var: "phone",
                value: phone,
              },
              {
                var: "subject",
                value: subject,
              },
              {
                var: "message",
                value: message,
              },
            ],
          },
        ],
      };
       try {
       console.log("Before user email fetch call")
       console.log("Sending user email with data:", JSON.stringify({
        to: [{ email: email, name: name }],
        from: { email: process.env.FROM_EMAIL, name: "ATC" },
        template_id: process.env.USER_CONFIRMATION_TEMPLATE_ID,
        variables: [
          {
            email: email,
            substitutions: [
              {
                var: "name",
                value: name,
              },
              {
                var: "message",
                value: message,
              },
            ],
          },
        ],
      }))
      const userEmailResponse = await fetch(
        "https://api.mailersend.com/v1/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
          },
          body: JSON.stringify({
            to: [{ email: email, name: name }],
            from: { email: process.env.FROM_EMAIL, name: "ATC" },
            template_id: process.env.USER_CONFIRMATION_TEMPLATE_ID,
            variables: [
              {
                email: email,
                substitutions: [
                  {
                    var: "name",
                    value: name,
                  },
                  {
                    var: "message",
                    value: message,
                  },
                ],
              },
            ],
          }),
        }
      );
       console.log("After user email fetch call")

      if (!userEmailResponse.ok) {
        const errorData = await userEmailResponse.json();
        console.error("MailerSend User Email Error:", errorData);
        throw new Error(
          `Failed to send user confirmation email: ${userEmailResponse.statusText}`
        );
      }
     console.log("User Email Sent Successfully!");
    } catch (error: any) {
      console.error("MailerSend User Email Error:", error);
       toast({
        title: "Oops! Something Went Wrong!",
        description:
          error.message ||
          "There was an error sending your confirmation email.",
        variant: "destructive",
      });
    }
     try {
         console.log("Before Owner email fetch call")
         console.log("Sending owner email with data:", JSON.stringify({
        to: [
          { email: "adude890@gmail.com", name: "Owner 1" },
          { email: "aviatorstrainingcentre@gmail.com", name: "Owner 2" },
        ],
        from: { email: process.env.FROM_EMAIL, name: "ATC" },
        template_id: process.env.OWNER_NOTIFICATION_TEMPLATE_ID,
        variables: [
          {
            email: "adude890@gmail.com",
            substitutions: [
              { var: "name", value: name },
              { var: "email", value: email },
              { var: "phone", value: phone },
              { var: "subject", value: subject },
              { var: "message", value: message },
            ],
          },
          {
            email: "aviatorstrainingcentre@gmail.com",
            substitutions: [
              { var: "name", value: name },
              { var: "email", value: email },
              { var: "phone", value: phone },
              { var: "subject", value: subject },
              { var: "message", value: message },
            ],
          },
        ],
      }))
        const ownerEmailResponse = await fetch(
          "https://api.mailersend.com/v1/email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
              Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
            },
            body: JSON.stringify({
              to: [
                { email: "adude890@gmail.com", name: "Owner 1" },
                { email: "aviatorstrainingcentre@gmail.com", name: "Owner 2" },
              ],
              from: { email: process.env.FROM_EMAIL, name: "ATC" },
              template_id: process.env.OWNER_NOTIFICATION_TEMPLATE_ID,
              variables: [
                {
                  email: "adude890@gmail.com",
                  substitutions: [
                    { var: "name", value: name },
                    { var: "email", value: email },
                    { var: "phone", value: phone },
                    { var: "subject", value: subject },
                    { var: "message", value: message },
                  ],
                },
                {
                  email: "aviatorstrainingcentre@gmail.com",
                  substitutions: [
                    { var: "name", value: name },
                    { var: "email", value: email },
                    { var: "phone", value: phone },
                    { var: "subject", value: subject },
                    { var: "message", value: message },
                  ],
                },
              ],
            }),
          }
        );
         console.log("After owner email fetch call")
        if (!ownerEmailResponse.ok) {
          const errorData = await ownerEmailResponse.json();
          console.error("MailerSend Owner Email Error:", errorData);
          throw new Error(
            `Failed to send owner notification email: ${ownerEmailResponse.statusText}`
          );
        }
         console.log("Owner Email Sent Successfully!");
      } catch (error: any) {
        console.error("MailerSend Owner Email Error:", error);
        toast({
          title: "Oops! Something Went Wrong!",
          description:
            error.message ||
            "There was an error sending your notification email.",
          variant: "destructive",
        });
      };
      } finally {
        setLoading(false);
      toast({
        title: isDemoBooking
          ? "Demo Request Received!"
          : "Message Sent Successfully!",
        description: isDemoBooking
          ? `We have received your demo request and will contact you shortly.`
          : `Thank you for reaching out! We will get back to you soon.`,
        variant: "default",
      });

      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      }
        } catch (error: any) {
          console.error("Firebase Error:", error);
          toast({
        title: "Error",
            title: "Oops! Something Went Wrong!",
            description:
              error.message ||
              "There was an error saving your information. Please try again later.",
            variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5">
        <FormField
          label="Full Name"
          id="name"
          name="name"
          placeholder="e.g. John Doe"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FormField
          label="Email Address"
          id="email"
          name="email"
          type="email"
          placeholder="e.g. john.doe@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-5">
        <FormField
          label="Phone Number <span className='text-foreground/50'>(Optional)</span>"
          id="phone"
          name="phone"
          placeholder="e.g. +91 12345 67890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-sm font-medium">
            Subject
          </Label>
          {isDemoBooking ? (
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={cn(
                "cursor-text",
                "focus-visible:ring-teal-500",
                "cursor-not-allowed bg-muted/50"
              )}
            />
          ) : (
            <Select
              value={subject}
              onValueChange={setSubject}
            >
              <SelectTrigger id="subject-select" className="focus:ring-teal-500">
                <SelectValue placeholder="Select a subject..." />
              </SelectTrigger>
              <SelectContent>
                {inquirySubjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <FormField
        label="Your Message"
        id="message"
        name="message"
        type="textarea"
        placeholder={
          isDemoBooking
            ? "Add any specific questions here..."
            : "Please provide details about your question or request..."
        }
        required={!isDemoBooking}
        readOnly={isDemoBooking}
        className={cn(
          "cursor-text",
          "focus-visible:ring-teal-500",
          isDemoBooking && "bg-muted/50 cursor-not-allowed"
        )}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div>
        <Button
          type="submit"
          size="lg"
          className={cn(
            "flex gap-2 justify-center items-center w-full",
            "overflow-hidden relative text-white bg-teal-600 rounded-full shadow-md transition-all duration-300 ease-out group hover:bg-teal-700 hover:shadow-lg dark:bg-teal-500 dark:hover:bg-teal-600",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={loading}
        >
          {loading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="ml-2">
                {isDemoBooking ? "Submitting Request..." : "Sending..."}
              </span>
            </>
          ) : (
            <>
              {isDemoBooking ? "Confirm Demo Request" : "Send Message"}{" "}
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
export default ContactForm;