import emailjs from '@emailjs/browser';



const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

export const sendEmailFrontend = (name, email, message) => {
  return emailjs.send(serviceId, templateId, { from_name: name, from_email: email, message }, publicKey);
};
