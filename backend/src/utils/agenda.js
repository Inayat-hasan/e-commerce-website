import Agenda from "agenda";

const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
  processEvery: "1 minute",
  maxConcurrency: 20,
});

const startAgenda = async () => {
  await agenda.start();
  console.log("Agenda started");
};

const stopAgenda = async () => {
  await agenda.stop();
  console.log("Agenda stopped");
};

export { agenda, startAgenda, stopAgenda };
