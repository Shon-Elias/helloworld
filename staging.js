
const color = require('chalk');

const { ActivityTypes, CardFactory, MessageFactory, builder } = require('botbuilder');
const { TextPrompt, AttachmentPrompt, ChoicePrompt, DateTimePrompt, DialogSet, WaterfallDialog } = require('botbuilder-dialogs');

const DIALOG_STATE_PROPERTY = 'dialogStateProp';
const USER_NAME_PROP = 'usernameProp';
const WHO_ARE_YOU = 'who_are_you';
const HELLO_USER = 'hello_user';


//  New by Shon
const SELECT_FORM = 'selectForm';
const CONFIRM_PROMPT = 'confirm_prompt';
const DATE_PROMPT = 'date_prompt';
const CalendarCard = require('./resources/EntryDateCalendarCard.json');
const DisruptionEndDateCard = require('./resources/DisruptionEndDateCalendarCard.json');
const DisruptionStartDateCard = require('./resources/DisruptionStartDateCalendarCard.json');
const ValidateEndDateCard = require('./resources/ValidateEndDateCard.json');
const SharedClientNotesCard = require('./resources/SharedClientNotesCard.json');
//

const NAME_PROMPT = 'name_prompt';

const DDclients = require('./readData').data[0];
const { today } = require('./utils')

console.log(color.magenta("TODAY", today))

////// Getting the clientName array
var clientProfile = {
  selectedClient: "",
  entryDate: "",
  disruption: "",
  startDate: "",
  endDate: "",
  askedToUpdate: false,
  askToAddnote: false,
  selectedCarePlan: "",
  clients: [],
  clientsRemain: [],
  carePlans: [],
  carePlansRemain: [],
  currentStep: 1
}

// Getting clients name and store it
// userProfile.clients
// var clientsnameCards = []
var carePlansCards = []
clientsName = [];
var name = '';
DDclients.forEach(function(client) {
    if(client["Client Middle Name"]){
        name = client["Client Last Name"]+", "+client["Client First Name"]+" "+client["Client Middle Name"];
    }
    else{
      name = client["Client Last Name"]+", "+client["Client First Name"];
    }
    clientsName.push(name);
    // Remove when move to production only when automate the file system
    clientProfile.clients.push(name)
    clientProfile.clientsRemain.push(name)
    // clientsnameCards.push((name)
  }



  ,this)
//


// Getting array of the users for cards
// DDclients.forEach(function(client) {
//   if(client["Client Middle Name"]){
//     clientsnameCards.push(client["Client Last Name"]+", "+client["Client First Name"]+" "+client["Client Middle Name"])
//   }else{
//     clientsnameCards.push(client["Client Last Name"]+", "+client["Client First Name"])
//   }
// })


class HealthBot {


    constructor(conversationState, userState) {
        // creates a new state accessor property. see
        this.conversationState = conversationState;
        this.userState = userState;

        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

        // console.log(color.blue("THIS STAT", JSON.stringify(this.dialogState)))
        this.userProfile = this.userState.createProperty("userProfile")
        this.clientName = this.userState.createProperty(USER_NAME_PROP); // usernameProp
        // this.entryDate = this.userState.createProperty("entryDate");
        this.reasonForDisruption = this.userState.createProperty("reasonForDisruption");
        // const disruptionReason = await this.reasonForDisruption.get(dc.context, dc.result)
        // this.startDate = this.userState.createProperty("startDate")
        this.endDate = this.userState.createProperty("endDate")


        // console.log(color.blue("THIS NAME", JSON.stringify(this.userName)))
        // console.log(color.blue("THIS USERSTATE", JSON.stringify(this.userState)))

        // adding the dialogs as a prop to dialogState
        this.dialogs = new DialogSet(this.dialogState);

        // console.log(color.magenta("DIALOGS", JSON.stringify(this.dialogs)))

        // Add prompts
        // this.dialogs.add(new TextPrompt(NAME_PROMPT));
        this.dialogs.add(new ChoicePrompt(CONFIRM_PROMPT));
        this.dialogs.add(new DateTimePrompt(DATE_PROMPT));
        this.dialogs.add(new AttachmentPrompt(NAME_PROMPT))
        // console.log(color.magenta("PROMPT DIALOG", JSON.stringify(this.dialogs)))

        // Create a dialog that asks the user for their name.
        // this.dialogs.add(new WaterfallDialog(WHO_ARE_YOU, [
        //     this.askForName.bind(this),
        //     this.collectAndDisplayName.bind(this)
        // ]));
        this.dialogs.add(new WaterfallDialog(SELECT_FORM,[
            this.selectFrom.bind(this),
            // this.displayName.bind(this)
        ]));

        // Create a dialog that displays a user name after it has been collceted.
        this.dialogs.add(new WaterfallDialog(HELLO_USER, [
            // this.displayName.bind(this),
            this.ddFormSelected.bind(this),
        ]));

        this.dialogs.add(new WaterfallDialog("DDmyEvolvServiceEntryDate", [
            this.myEvolvServiceEntryDate.bind(this)
        ]));

        this.dialogs.add(new WaterfallDialog("DDselectClient", [
          this.DDselectClient.bind(this)
          // this.collectAndDisplayName.bind(this)
          // this.DDcurrentClient.bind(this)
      ]));
        this.dialogs.add(new WaterfallDialog("DDcurrentClient", [
        this.DDcurrentClient.bind(this)
        // this.DDcurrentClient.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDUpdateDisruption", [
        this.DDUpdateDisruptionFunc.bind(this)
        // this.DDDisruptionStartDateFunc.bind(this)
      ]));
      this.dialogs.add(new WaterfallDialog("DDDisruptionStartDate", [
        this.DDDisruptionStartDateFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDDisruptionEndDate", [
        this.DDDisruptionEndDateFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("validationForEndDate", [
        this.validationForEndDateFunc.bind(this)
      ]));


      this.dialogs.add(new WaterfallDialog("validEndDate", [
        this.validEndDateFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDSelectedStuffAction", [
        this.DDSelectedStuffActionFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDSelectedPromptLevel", [
        this.DDSelectedPromptLevelFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDAddingNote", [
        this.DDAddingNoteFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDshareUserNote", [
        this.DDshareUserNoteFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDMoreCarePlans", [
        this.DDMoreCarePlansFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDchooseAdifferentClient", [
        this.DDchooseAdifferentClientFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("DDGoodBye", [
        this.DDGoodByeFunc.bind(this)
      ]));

      this.dialogs.add(new WaterfallDialog("welcomeBack", [
        this.welcomeBackFunc.bind(this)
      ]));




    }

    async selectFrom(dc){
      // // await dc.prompt(CONFIRM_PROMPT, 'Do you want to give your age?', ['yes', 'no'])
      // console.log(color.red("DCCCCC", dc.context._activity.text));

      const message = MessageFactory.attachment(
        CardFactory.heroCard(
          "Welcome to the The Foundling careBot!",
              [],
              ["DD Service Entry"],
              {

                  text: "Please select the myEvolv Mobile App from the list below so we can begin our work together..."
              }
         )
    );
    await dc.prompt(CONFIRM_PROMPT, message)
    return await dc.endDialog();
    }

    // The first step in this waterfall asks the user for their name.
    async ddFormSelected(dc) {
      clientProfile.currentStep = 2
      const message = MessageFactory.attachment(
        CardFactory.heroCard(
          "Hey there!",
              [],
              ["Ok, I'm ready to start"],
              {

                  text: "Welcome to The New York Foundling's " + DDclients[0]['Form Name'] + " process for myEvolv.\n\n Let's confirm a few details.  Will you be completing the service documentation for a client in the "+DDclients[0]['Security Assigned Workgroups'] +"?"
              })
    );
    await dc.prompt(CONFIRM_PROMPT, message)
    return await dc.endDialog();
      //   return await dc.prompt(NAME_PROMPT, `What is your name, human?`);
      // }
        // console.log(color.yellow("who the hell are you DC", JSON.stringify(dc)));
    }

    async myEvolvServiceEntryDate(dc, step){
      clientProfile.currentStep = 3
      await dc.context.sendActivity({
        attachments: [CardFactory.adaptiveCard(CalendarCard)]
      })
    /*   const bt = {
    //     type: 'imBack',
    //     title: 'Today',
    //     value: "Entry date:\n"+today
    //   }

    //   const message = MessageFactory.attachment(
    //     CardFactory.heroCard(
    //       "",
    //           [],
    //           [bt],
    //           {
    //               text: "So we can do a quick search of myEvolv for service notes that still need to be entered.\n\n \n\n Please select the myEvolv Service Entry Date you would like to submit:"
    //           })
    // );
    // // console.log(color.blue("DATE HERE1"))
    // await dc.prompt(DATE_PROMPT, message)
    */ console.log(color.blue("DATE HERE2"))
    }

    async DDselectClient(dc, step){
      clientProfile.currentStep = 4
      console.log(color.blue("Fantastic clientProfile.clientsRemain",clientProfile.clientsRemain))

      console.log(color.blue("Fantastic clientProfile.clients",clientProfile.clients))
        // console.log(color.magenta("CLIENTS", JSON.stringify(clientsnameCards)))
        const message = MessageFactory.suggestedActions(clientProfile.clientsRemain);
        // await dc.message("Please")
        await dc.context.sendActivity("Please choose The Foundling client \n\nyou would like to complete the\n\n"+DDclients[0]['Form Name'] + " for:")
        await dc.prompt(CONFIRM_PROMPT, message)
        return dc.endDialog()
    }

    async DDcurrentClient(dc){
      clientProfile.currentStep = 5
      // const entryDate = await this.entryDate.get(dc.context, dc.result)
      // const user = await this.clientName.get(dc.context, dc.result);
      // console.log(color.blue("USER",user))
      const client = await this.userProfile.get(dc.context, clientProfile);
      console.log(color.blue("WTF"), dc.context)

      const message = MessageFactory.attachment(
        CardFactory.heroCard(
          "Great, thanks for that info.",
              [],
              ["Yes, let's update", "Not right now"],
              {
                  text: "I see that myEvolv is showing that "+client.selectedClient+ " does not have any Placement Disruptions active for "+client.entryDate+".  Do we need to update "+client.selectedClient+"'s myEvolv record with a new Placement Disruption for "+client.entryDate+"?"
              })
    );
    await dc.prompt(CONFIRM_PROMPT, message)
    return await dc.endDialog();
    }

    async DDUpdateDisruptionFunc(dc){
      clientProfile.currentStep = 6
      await dc.prompt(CONFIRM_PROMPT, "Ok. Please enter the reason for the Disruption:")
      // return await dc.endDialog()
      return dc.endDialog()

    }

    async DDDisruptionStartDateFunc(dc){
      clientProfile.currentStep = 7

      // console.log(color.blue("disruption",disruption))

      // return await dc.prompt(CONFIRM_PROMPT, "YEAHHHH. Please enter the reason for the Disruption:")
      // await dc.context.sendActivity({
        // attachments: [CardFactory.adaptiveCard(CalendarCard)]
      // })
      // await dc.prompt(CONFIRM_PROMPT, "SOOOOOOO")

      // return await dc.endDialog()

      await dc.context.sendActivity({
        attachments: [CardFactory.adaptiveCard(DisruptionStartDateCard)]
      })

      return dc.endDialog()
    }

    async DDDisruptionEndDateFunc(dc){
      // const startDate = await this.startDate.get(dc.context, dc.result);
      clientProfile.currentStep = 8
      // console.log(color.yellow("startdate", startDate))
      await dc.context.sendActivity({
        attachments: [CardFactory.adaptiveCard(DisruptionEndDateCard)]
      })
      return dc.endDialog()
  }

  async validationForEndDateFunc(dc){
    clientProfile.currentStep = 8
     await dc.context.sendActivity({
      attachments: [CardFactory.adaptiveCard(ValidateEndDateCard)]
    })
    return dc.endDialog()
  }


// POOOOOOOO
  async validEndDateFunc(dc){
    clientProfile.currentStep = 9



      // Getting CarePlans
      DDclients.forEach((client)=> {
        console.log(color.blue("Foreach", client["Client First Name"]+" "+client["Client Last Name"]))
        console.log("clientNAme", clientProfile.selectedClient)

        // ADD MIDDLE NAME CHECK

        if(client["Client Last Name"]+", "+client["Client First Name"] === clientProfile.selectedClient || client["Client Last Name"]+", "+client["Client First Name"]+" "+client["Client Middle Name"] === clientProfile.selectedClient){

          // clientProfile.selectedClient
          console.log(color.blue("IF"))

          numberOfCarePlanGoal(client);

          // var i = 1;
        }
      })



      function numberOfCarePlanGoal(client){
        var i = 1;
      console.log(color.blue("Function"))
      clientProfile.carePlans = []
      carePlansCards=[]
      while(client["Valued Entry Number "+i+" Description"] !== undefined){
        // clientProfile.carePlans.push(client["Valued Entry Number "+i+" Description"])
        console.log(color.blue("b4"))
        clientProfile.carePlans.push(client["Valued Entry Number "+i+" Description"])
        var card = CardFactory.receiptCard ({
          title: client["Valued Entry Number "+i+" Description"],
          buttons: CardFactory.actions([
            {
                type: 'imBack',
                title: 'Select',
                value: "You selected: "+client["Valued Entry Number "+i+" Description"]
            }
          ])

        })
        // Also worked with oauthCard
        // var card = CardFactory.signinCard(
        //   "Select",  // text on th button
        //   "You selected: "+client["Valued Entry Number "+i+" Description"], // val
        //   client["Valued Entry Number "+i+" Description"] //body
        // )
        console.log(color.blue("A9"))


      console.log(color.blue("iiiii"), i)
      console.log(color.blue("bacrdi"), card)

      carePlansCards.push(card)


      i++
    }
    // clientProfile.numberOfCarePlanGoal = i-1

    // console.log(color.blue("carePlansCards"), clientProfile.carePlans)


  }
  await this.userProfile.set(dc.context, clientProfile ) ;

  const message = MessageFactory.carousel(carePlansCards)

  await dc.context.sendActivity("Ok. great.\n\nIt looks like " + clientProfile.selectedClient + " has the following " + clientProfile.carePlans.length + " care plan goals in myEvolv that need to be documented for " + clientProfile.entryDate + ".\n\nPlease choose the Valued Outcome/Staff Action you would like to complete documentation for:\n\n")
  //  await dc.context.sendActivity(message)
  await dc.prompt(CONFIRM_PROMPT, message)
  return dc.endDialog()

  }

  async DDSelectedStuffActionFunc(dc){
    clientProfile.currentStep = 10
    console.log(color.red("Fire to"),"the rain")
    const ticket = CardFactory.receiptCard ({
      title: "For "+clientProfile.selectedClient+" "+clientProfile.selectedCarePlan+". Please select"+clientProfile.selectedClient+" prompt level on "+clientProfile.entryDate,
      buttons: CardFactory.actions([
        {
            type: 'imBack',
            title: 'Prompt Level 1 - Denied',
            value: "Prompt Level 1 - Denied"
        },
        {
          type: 'imBack',
          title: 'Prompt Level 2 - Physical',
          value: "Prompt Level 2 - Physical"
        },
        {
          type: 'imBack',
          title: 'Prompt Level 3 - Partial Physical',
          value: "Prompt Level 3 - Partial Physical"
        },
        {
          type: 'imBack',
          title: 'Prompt Level 4 - Gestural',
          value: "Prompt Level 4 - Gestural"
        },
        {
          type: 'imBack',
          title: 'Prompt Level 5 - Verbal',
          value: "Prompt Level 5 - Verbal"
        },
        {
          type: 'imBack',
          title: 'Prompt Level 6 - Independent',
          value: "Prompt Level 6 - Independent"
        }
      ])

    })
    const msg = MessageFactory.carousel([ticket])

    await dc.prompt(CONFIRM_PROMPT, msg)
    return dc.endDialog()
  }

  async DDSelectedPromptLevelFunc(dc){
    clientProfile.currentStep = 11
    console.log(color.blue("clientProfile.selectedCarePlan"), clientProfile.selectedCarePlan)
    const card = CardFactory.receiptCard ({
      title: "For "+clientProfile.selectedClient+" "+clientProfile.selectedCarePlan+"Please enter your notes:",
      buttons: CardFactory.actions([
        {
            type: 'imBack',
            title: 'Yes',
            value: "Yes, I would like to add a note"
        },
        {
          type: 'imBack',
          title: 'No',
          value: "Not right now, thank you!"
        }
      ])
    })
    const message = MessageFactory.carousel([card])

    await dc.prompt(CONFIRM_PROMPT, message)
    return await dc.endDialog();
  }


  async DDAddingNoteFunc(dc){
    clientProfile.currentStep = 11
    await dc.prompt(NAME_PROMPT , "For "+clientProfile.selectedCarePlan+" Please enter your notes:")
    return await dc.endDialog()
  }

  async DDshareUserNoteFunc(dc){
    clientProfile.currentStep = 12
    await dc.context.sendActivity("For "+clientProfile.selectedClient+", "+clientProfile.selectedCarePlan+"  Please let us know who you'd like to share your notes with by selecting one or more of the following:")
    await dc.context.sendActivity({
      attachments: [CardFactory.adaptiveCard(SharedClientNotesCard)]
    })
  }

  async DDMoreCarePlansFunc(dc){
    clientProfile.currentStep = 13
      var updatedCarePlans = []
      var carePlansCards = []
      clientProfile.carePlans.forEach(cp => {
        if(cp !== clientProfile.selectedCarePlan){
          updatedCarePlans.push(cp)

          var card = CardFactory.receiptCard ({
            title: cp,
            buttons: CardFactory.actions([
              {
                  type: 'imBack',
                  title: 'Select',
                  value: "You selected: "+cp
              }
            ])

          })

          carePlansCards.push(card)
        }
      })

      var card = CardFactory.receiptCard ({
        title: "No thanks, that's all for now.",
        buttons: CardFactory.actions([
          {
              type: 'imBack',
              title: 'Select',
              value: "No thanks, that's all for now. I'll complete the remaining later."
          }
        ])
      })

      carePlansCards.push(card)

      clientProfile.carePlans = updatedCarePlans

      console.log(color.blue("clientProfile.carePlans UPDATE",clientProfile.carePlans))
      console.log(color.blue("carePlansCards",carePlansCards))


  const message = MessageFactory.carousel(carePlansCards)

  await dc.context.sendActivity("Ok. great.\n\nIt looks like " + clientProfile.selectedClient + " has the following " + clientProfile.carePlans.length + " care plan goals in myEvolv that need to be documented for " + clientProfile.entryDate + ".\n\nPlease choose the Valued Outcome/Staff Action you would like to complete documentation for:\n\n")
  //  await dc.context.sendActivity(message)
  await dc.prompt(CONFIRM_PROMPT, message)
  return dc.endDialog()

  }


  async DDchooseAdifferentClientFunc(dc){
    clientProfile.currentStep = 14
    const clientsnameCards = []
    clientProfile.clientsRemain = []
    clientProfile.clients.forEach(c => {
      if(c !== clientProfile.selectedClient){
        clientsnameCards.push(c)
        clientProfile.clientsRemain.push(c)
      }
    })

    clientsnameCards.push("No thanks, that's all for now.")

    clientProfile.carePlans.length = 0;
    // clientProfile = {
    //   selectedClient: "",
    //   entryDate: "",
    //   disruption: "",
    //   startDate: "",
    //   endDate: "",
    //   askedToUpdate: false,
    //   askToAddnote: false,
    //   selectedCarePlan: "",
    //   // clients: [],
    //   clientsRemain: ,
    //   carePlans: [],
    //   carePlansRemain: []
    // }
    console.log(color.blue("Fantastic clientProfile.clientsRemain",clientProfile.clientsRemain))

    console.log(color.blue("Fantastic clientProfile",clientProfile))

    const message = MessageFactory.suggestedActions(clientsnameCards);
        // await dc.message("Please")
        await dc.context.sendActivity("Fantastic!! Below are the other clients at "+DDclients[0]['Form Name']+" that also need to have service entry notes added for "+clientProfile.entryDate+". Please choose The Foundling client you would like to complete Res Hab Daily Service Documentation Checklist for:")
        await dc.prompt(CONFIRM_PROMPT, message)
        return dc.endDialog()

  }


  async DDGoodByeFunc(dc){
    clientProfile.clientsRemain = clientProfile.clients
    await dc.context.sendActivity("Ok. great.\nTogether, we are 100% responsible for ensuring that everyone is embraced by The Foundling's heart as they strive to reach their full potential.\nHave a perfect day!")
  }


  async welcomeBackFunc(dc){
    const message = MessageFactory.attachment(
      CardFactory.heroCard(
        "Welcome back to the The Foundling careBot!",
            [],
            ["DD Service Entry"],
            {

                text: "Please select the myEvolv Mobile App from the list below so we can begin our work together..."
            }
       )
  );
  await dc.prompt(CONFIRM_PROMPT, message)
  return await dc.endDialog();
  }

    /**
     *
     * @param {Object} context on turn context object.
     */
    async onTurn(turnContext) {

        // console.log(color.red("turnContext.activity.type", JSON.stringify(turnContext.activity.type)));
      //  console.log(color.red(turnContext.activity.text));
      // console.log(color.blue("HERE1"))
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Create dialog context
            const dc = await this.dialogs.createContext(turnContext);

            console.log(color.blue("turnContext"), JSON.stringify(turnContext))
            await dc.continueDialog();
            // console.log(color.blue("HERE3"))
            // const utterance = (turnContext.activity.text || '').trim().toLowerCase();
            // if (utterance === 'cancel') {
            //     if (dc.activeDialog) {
            //         await dc.cancelAllDialogs();
            //         await dc.context.sendActivity(`Ok... Cancelled.`);
            //     } else {
            //         await dc.context.sendActivity(`Nothing to cancel.`);
            //     }
            // }
            var startDate = null
            var entryDate = null
            var disruption = null
            var promptLevel = null
            var note = ""
            var carePlan = null
            var share = null
            var text = turnContext.activity.text;
            // if(turnContext._activity.value.shareDocument !== null){
              console.log(color.blue("TOTOTOTO"))

              // const share = turnContext._activity.value.shareDocument
            // }

            console.log(color.blue("tetet", text))
            // console.log(color.blue("shshs", share))

            if(text === undefined){
              console.log(color.blue("SUCCCC"), JSON.stringify(dc))
              entryDate = dc.context._activity.value.entryDate
              console.log(color.blue("ENEE"), entryDate)
              if(entryDate){
                // console.log(color.blue("userProfile.entryDate"), entryDate)
                // userProfile.entryDate = entryDate
                try{
                  console.log(color.blue("clientProfile"), clientProfile)
                  clientProfile.entryDate = dc.context._activity.value.entryDate
                }
                catch(e){
                  console.error("COME ON THIS", e)
                }
              }
              try{
                console.log(color.blue("userProfile.entryDate"), clientProfile.entryDate)
                console.log("PLEASSSSE")
                await this.userProfile.set(dc.context, clientProfile);
              }
              catch(err){
                console.error(errr)
              }
              // await this.userProfile.set(dc.context, userProfile);

            }
            if(text === undefined && clientProfile.currentStep === 7){
              console.log(color.blue("MAY1", dc.context._activity.value.disruptionStartDate ))

              startDate = dc.context._activity.value.disruptionStartDate
              if(startDate){

                clientProfile.startDate = dc.context._activity.value.disruptionStartDate
              }
              console.log(color.blue("startDate", startDate))

              await this.userProfile.set(dc.context, clientProfile);

              return await dc.beginDialog("DDDisruptionEndDate")
            }

            console.log(color.blue("SHIMON", text))
            if(text){
              if(text.includes("You selected:")){
                carePlan = text
              }else if(text.includes("Prompt Level ")){
                promptLevel = text
              }else if(text === "Yes, I would like to add a note"){
                text = text;
              }else if(text === "Not right now, thank you!"){
                text = text;
              }else if(clientProfile.askedToUpdate){
                disruption = text;
              }else if(clientProfile.askToAddnote){
                note = text
              }
            }

            if(text === "No thanks, that's all for now."){
                  await dc.beginDialog("DDGoodBye")
                  return dc.endDialog()
            }

            if(text){
              if(text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello' || text.toLowerCase() === 'reboot' && clientProfile.currentStep === 14 ){

                await dc.beginDialog("welcomeBack")
                return await dc.endDialog()
              }
            }

            //  await this.reasonForDisruption.get(dc.context, text);
            console.log(color.blue("reasonForDisruption", disruption))




            // To activate validationForEndDate
            if(!text){
              console.log(color.blue("111"))

              if(!startDate){
                console.log(color.blue("222"))
                endDate = dc.context._activity.value.endDate
                console.log(color.blue("end111"),endDate)

                if(endDate){
                  clientProfile.endDate = endDate;
                  console.log(color.blue("endDate"), dc.context)
                  await this.userProfile.set(dc.context, clientProfile);
                  var profile = await this.userProfile.get(dc.context, clientProfile);
                  console.log(color.blue("end111", endDate))
                  console.log(color.blue("start111"), startDate)
                  if(endDate < profile.startDate){
                    return await dc.beginDialog("validationForEndDate")
                  }else{

                    return await dc.beginDialog("validEndDate")
                  }
                }
              }
            }

            // if(!text){
            //   console.log(color.yellow("111"))

            //   if(!startDate){
            //     console.log(color.yellow("222"))
            //     const validEndDate = dc.context._activity.value.validEndDate
            //     console.log(color.yellow("333"), validEndDate)
            //     if(validEndDate){
            //       const profile = await this.userProfile.get(dc.context, clientProfile);
            //       console.log(color.blue("end111", endDate))
            //       console.log(color.blue("start111", profile.startDate))
            //       if(validEndDate < profile.startDate){
            //         return await dc.beginDialog("validationForEndDate")
            //       }else{
            //         clientProfile.endDate = validEndDate

            //         await this.userProfile.set(dc.context, clientProfile);
            //         return await dc.beginDialog("validEndDate")
            //       }
            //     }
            //   }
            // }



            if(text === undefined){
              share = turnContext._activity.value.shareDocument
              // share = share.split(",")
              console.log(color.blue("shshs", share))
            }
            var endDate = null
            // conole.log(color.yellow("DISDIS", disruption))
            // Create an array with the valid color options.
            // const validColors = ['Red', 'Blue', 'Yellow'];

            // if (!turnContext.responded) {
            //   console.log(color.blue("HERE5"))
            //     await dc.continueDialog();
            // }

            // If the `text` is in the Array, a valid color was selected and send agreement.
            if (text === "Let's Get Started") {
                // await turnContext.sendActivity(`I agree, ${ text } is the best color.`);
                // await this.selectFrom(turnContext);
                text = ""
                console.log(color.blue("HERE4"))
                await dc.beginDialog(SELECT_FORM)
            } else if(text === "DD Service Entry" && clientProfile.currentStep === 1) {
                await dc.beginDialog(HELLO_USER)

            // } else if(text === "EBCP STEPS Contact Entry"){

            //   await dc.beginDialog(HELLO_USER)
            }else if(text === "Ok, I'm ready to start" && clientProfile.currentStep === 2){
              // await turnContext.sendActivity({

              //   attachments: CardFactory.adaptiveCard(CalendarCard)
              // })
              await dc.beginDialog("DDmyEvolvServiceEntryDate");
            }else if(!text && clientProfile.currentStep === 3){
              if(entryDate){
                if(entryDate.includes("-")){
                  // await this.entryDate.set(dc.context, entryDate);
                  await dc.beginDialog("DDselectClient")
                }
            }
          }else if(clientProfile.clients.includes(text) && clientProfile.currentStep === 4){
            console.log(color.yellow("nammm", text))

            clientProfile.selectedClient = text;
              console.log(color.yellow("nammm", clientProfile.selectedClient))

              await this.userProfile.set(dc.context, clientProfile);

              // await this.clientName.get(dc.context, text);
              await dc.beginDialog("DDcurrentClient")
            }else if(text === "Yes, let's update" && clientProfile.currentStep === 5){
              clientProfile.askedToUpdate = true
              await dc.beginDialog("DDUpdateDisruption")
            }else if(text === "Not right now" && clientProfile.currentStep === 8){
              await dc.beginDialog("validEndDate")
          }else if(disruption && clientProfile.currentStep === 6){
              clientProfile.askedToUpdate = false
              // I saved it on the top in order to manipulate the data that's why I commant the line blelow
              // await this.reasonForDisruption.get(dc.context, text)
              clientProfile.disruption = disruption
              await this.userProfile.set(dc.context, clientProfile);
              await dc.beginDialog("DDDisruptionStartDate")
            }else if(text === "Later" && clientProfile.currentStep === 8){
              await dc.beginDialog("validEndDate")
            }else if(text.includes("You selected:" && clientProfile.currentStep === 9)){
              clientProfile.askedToUpdate = false
              clientProfile.selectedCarePlan = text.split("You selected: ")[1]
              console.log(color.blue("clientProfile.selectedCarePlan"),clientProfile.selectedCarePlan)
              await this.userProfile.set(dc.context, clientProfile)
              await dc.beginDialog("DDSelectedStuffAction")
            }else if(text.includes("Prompt Level" && clientProfile.currentStep === 10)){
              // clientProfile.selectedCarePlan = text.slice("You selected: ")[1]
              // await this.userProfile.set(dc.context, clientProfile)
              await dc.beginDialog("DDSelectedPromptLevel")

            }else if(text === "Yes, I would like to add a note" && clientProfile.currentStep === 11){
              clientProfile.askToAddnote = true
              await dc.beginDialog("DDAddingNote")
            }if(text === "Not right now, thank you!" && clientProfile.currentStep === 11){
              clientProfile.askToAddnote = false
              await dc.beginDialog("DDMoreCarePlans")
            }else if(note && clientProfile.currentStep === 12){
              clientProfile.askToAddnote = false
              await dc.beginDialog("DDshareUserNote")
            }

            if(share && clientProfile.currentStep === 13){
              console.log(color.blue("shshsINSIDE", share))
              await dc.beginDialog("DDMoreCarePlans")
            }else if(text !== undefined){
                if(text === "No thanks, that's all for now. I'll complete the remaining later."){
                  await dc.beginDialog("DDchooseAdifferentClient")
                }
                // else if(text === "No thanks, that's all for now."){
                  // await dc.beginDialog("DDGoodBye")
                // }
            }


            if(startDate && clientProfile.currentStep === 7){
              if(startDate.includes('-')){
                if(!endDate){


                  // await this.startDate.get(dc.context, startDate);


                  return await dc.beginDialog("DDDisruptionEndDate")
                }
              }
            }

            // else if(text = "Not right now" ||)


            // Continue the current dialog


            // Show menu if no response sent
            // if (!turnContext.responded) {
            //   console.log(color.blue("HERE6"))
            //     var userName = await this.userName.get(dc.context, null);
            //     if (userName) {
            //       console.log(color.blue("HERE7"))
            //         await dc.beginDialog(HELLO_USER);
            //     } else {
            //       console.log(color.blue("HERE8"))
            //         await dc.beginDialog(WHO_ARE_YOU);
            //     }
            // }
        } else if (
            turnContext.activity.type === ActivityTypes.ConversationUpdate
        ) {
            // Do we have any new members added to the conversation?
            // console.log(color.magenta("turnContext.activity", JSON.stringify(turnContext.activity)));
            console.log(color.blue("HERE9"))
            if (turnContext.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (var idx in turnContext.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message.
                    // Since the bot is the recipient for events from the channel,
                    // context.activity.membersAdded === context.activity.recipient.Id indicates the
                    // bot was added to the conversation, and the opposite indicates this is a user.
                    if (turnContext.activity.membersAdded[idx].id !== turnContext.activity.recipient.id) {
                        // Send a "this is what the bot does" message to this user.
                        // await turnContext.sendActivity({ attachments: [CardFactory.thumbnailCard(
                        //     "Hello! I'm careBot.",
                        //     [{url: 'https://cdn1.iconfinder.com/data/icons/bots/280/bot-10-2-512.png'}],
                        //     [{
                        //         type: 'Action.Submit',
                        //         title: 'Get started',
                        //         value: 'OK'
                        //     }],
                        //     {

                        //         text: "I’m here to streamline human services delivery through an intuitive conversational approach. I can help you chat with your electronic health record (EHR) to securely lookup information and complete your assigned workflows."
                        //     }
                        // )] });

                      //   const message = MessageFactory.carousel([
                      //     CardFactory.heroCard('title1', ['imageUrl1'], ['button1']),
                      //     CardFactory.heroCard('title2', ['imageUrl2'], ['button2']),
                      //     CardFactory.heroCard('title3', ['imageUrl3'], ['button3'])
                      //  ]);
                      //  await turnContext.sendActivity(message);

                      const message = MessageFactory.attachment(
                        CardFactory.thumbnailCard(
                          "Hello! I'm careBot.",
                              [{url: 'https://cdn1.iconfinder.com/data/icons/bots/280/bot-10-2-512.png'}],
                              ["Let's Get Started"],
                              {

                                  text: "I’m here to streamline human services delivery through an intuitive conversational approach. I can help you chat with your electronic health record (EHR) to securely lookup information and complete your assigned workflows."
                              }
                         )
                    );
                    console.log(color.blue("HERE10"))
                    await turnContext.sendActivity(message);

                    }
                }
            }
        }

        // Save changes to the user state.
        // console.log(color.magenta("turnContext", JSON.stringify(turnContext)))
        // await this.userProfile.get(turnContext, userProfile)


        await this.userState.saveChanges(turnContext);
        // console.log(color.blue("out", share))

        console.log(color.magenta("****************************userState****************************", JSON.stringify(this.userState)))
        console.log(color.blue("HERE11"))
        // End this turn by saving changes to the conversation state.
        await this.conversationState.saveChanges(turnContext);
    }
}

module.exports.HealthBot = HealthBot;









/*

  async validEndDateFunc(dc){



// Getting CarePlans
    DDclients.forEach((client)=> {
        console.log(color.blue("Foreach", client["Client First Name"]+" "+client["Client Last Name"]))
        console.log("clientNAme", clientProfile.selectedClient)

        // ADD MIDDLE NAME CHECK

        if(client["Client Last Name"]+", "+client["Client First Name"] === clientProfile.selectedClient || client["Client Last Name"]+", "+client["Client First Name"]+" "+client["Client Middle Name"] === 'Smith, Mary Ann'){

          // clientProfile.selectedClient
          console.log(color.blue("IF"))

          numberOfCarePlanGoal(client);

          // var i = 1;
        }
    })



    function numberOfCarePlanGoal(client){
      var i = 1;
      // console.log(color.blue("Function"), client)

      while(client["Valued Entry Number "+i+" Description"] !== undefined){
        // clientProfile.carePlans.push(client["Valued Entry Number "+i+" Description"])

        // try{
          // const card = client["Valued Entry Number "+i+" Description"]
          const card = {
            type: 'imBack',
            title: client["Valued Entry Number "+i+" Description"],
            value: "You selected:"+client["Valued Entry Number "+i+" Description"]
          }
          // const card = MessageFactory.suggestedActions(
          //   CardFactory.heroCard(
          //       'White T-Shirt',
          //       CardFactory.actions
          //       ['https://example.com/whiteShirt.jpg'],
          //       ['buy']
          //    )
          // );
          // const card = MessageFactory.carousel(
          //   CardFactory.heroCard(dc)
          //   .title(client["Valued Entry Number "+i+" Description"])
          //   .button("Select")
          // );

          console.log(color.blue("iiiii"), i)
          console.log(color.blue("bacrdi"), card)
          console.log(color.blue("carePlansCards"), carePlansCards)

          carePlansCards.push(card)
        // }
        // catch(err){
        //   console.log("COMOM", err)
        // }
          console.log(color.blue("carePlansCards"), carePlansCards)
          i++
      }

      // await dc.prompt(HELLO_USER, "YEAHHH")
        // return dc.endDialog()


    }

    console.log(color.blue("carePlansCards"), carePlansCards)

    const message = MessageFactory.suggestedActions( CardFactory.heroCard([carePlansCards]));
  //   const message = MessageFactory.attachment(
  //     // 'this is your title',
  //     CardFactory.suggestedActions([carePlansCards])

  //  )
    // .text("HEY IT WORKS")
    // .actions(carePlansCards)
    //  await dc.thumbnailCard( message)
    await dc.context.sendActivity(message)
    // await dc.prompt(CONFIRM_PROMPT, message)
    console.log(color.blue("This see"), dc)
     return dc.endDialog()
}
*/



// Mon 20:25 I stopped trying
/*
  async validEndDateFunc(dc){

// Getting CarePlans
    DDclients.forEach((client)=> {
        console.log(color.blue("Foreach", client["Client First Name"]+" "+client["Client Last Name"]))
        console.log("clientNAme", clientProfile.selectedClient)

        // ADD MIDDLE NAME CHECK

        if(client["Client Last Name"]+", "+client["Client First Name"] === 'Smith, Mary Ann' || client["Client Last Name"]+", "+client["Client First Name"]+" "+client["Client Middle Name"] === 'Smith, Mary Ann'){
          console.log(color.blue("IF"))
          // Replace the name 'Smith Mary, Ann" with that line
          // clientProfile.selectedClient

          numberOfCarePlanGoal(client);

          // var i = 1;
        }
    })



    function numberOfCarePlanGoal(client){
      var i = 1;
      // console.log(color.blue("Function"), client)

      while(client["Valued Entry Number "+i+" Description"] !== undefined){
        // clientProfile.carePlans.push(client["Valued Entry Number "+i+" Description"])

          // This works
          // const card = client["Valued Entry Number "+i+" Description"]
          // console.log(color.blue("BE4"))
          // var card = new builder.ThumbnailCard(dc)
          //   //.subtitle("Ok. great.")
          //    .text(client["Valued Entry Number "+i+" Description"])
          //   .buttons([
          //       builder.CardAction.imBack(dc, "You selected:\n" + client["Valued Entry Number "+i+" Description"]+"", "select")
          //     ])

          //   console.log(color.blue("After"))

          // const card = (
          //       // 'White T-Shirt',
          //       // ['https://example.com/whiteShirt.jpg'],

          //       'buy'
          //    )

          // const card = MessageFactory.carousel(
          //   CardFactory.heroCard(dc)
          //   .title(client["Valued Entry Number "+i+" Description"])
          //   .button("Select")
          // );

          console.log(color.blue("iiiii"), i)
          console.log(color.blue("bacrdi"), card)
          console.log(color.blue("carePlansCards"), carePlansCards)

          carePlansCards.push(card)
          console.log(color.blue("carePlansCards"), carePlansCards)
          i++
      }

      // await dc.prompt(HELLO_USER, "YEAHHH")
        // return dc.endDialog()


    }

    // var card = new builder.ThumbnailCard(dc)
    //       .text("I'd like to enter Staff Action for "+clientProfile.selectedClient.split(", ")[1])
    //       .buttons([
    //       builder.CardAction.imBack(dc, "I'd like to enter Staff Action for "+clientProfile.selectedClient.split(", ")[1]), "select"])
    //       attachments.push(card)

    //       var card = new builder.HeroCard(dc)

    //       .text("No thanks, that's all for now. I'll complete the remaining later.")
    //       .buttons([
    //           builder.CardAction.imBack(dc, "No thanks, that's all for now. I'll complete the remaining later", "select")
    //       ]);



    //      attachments.push(card)


    //      var msg = new builder.Message(session)
    //         // .speak(speak(session, 'help_ssml'))
    //         //msg.subtitle("Ok. great.")
    //         msg.text("Ok. great. \n\nIt looks like " + clientProfile.selectedClient + " has the following " + "#####" + " care plan goals in myEvolv that need to be documented for " + clientProfile.endDate + ".\n\nPlease choose the Valued Outcome/Staff Action you would like to complete documentation for:\n\n")
    //         msg.attachments(attachments)
    //         //.addAttachment(card)
    //         .inputHint(builder.InputHint.acceptingInput);

    // console.log(color.blue("carePlansCards"), carePlansCards)
    // This works
    // const message = MessageFactory.suggestedActions(carePlansCards);

    // const message = MessageFactory.carousel(CardFactory.heroCard([carePlansCards]));
    // Didnt work
    // const msgs = []
    // carePlansCards.forEach(pllllan)=>{
    //   const message = MessageFactory.suggestedActions(plan);

    //   msgs.push(plan)

    // }

    // 1
    // const message = MessageFactory.suggestedActions([
    //   carePlansCards.forEach(carePlan) => {
    //     return {
    //       title: carePlan,
    //       buttons: ['Select']
    //     }
    //   }
    // ]);


    // 2
    // const message = carePlansCards.forEach(plan) => {
    //   return MessageFactory.suggestedActions(plan);
    // }

    // const message = MessageFactory.carousel([{
    //   text: "IT WORKS",
    //   actions: carePlansCards
    // }])
    // .text("HEY IT WORKS")
    // .actions(carePlansCards)
    //  await dc.thumbnailCard( message)
    // await dc.sendActivity(message)
    await dc.prompt(CONFIRM_PROMPT, msg)
    // dc.send(msg)
    // await dc.prompt(CONFIRM_PROMPT, carePlansCards)
    console.log(color.blue("Messi"), message)
     return dc.endDialog()
}
*/










 /* This works with dummy data array
async validEndDateFunc(dc){

  var list = ["Shon Elias", "Arik Hill", "Tobi Peach", "Ido Shemesh", "Roy Toy"]
  const cards = []

  for (let i = 0; i < list.length; i++) {
    const card = CardFactory.signinCard(list[i],[],list[i])
    cards.push(card)

  }
  // list.forEach(l => {
  //   const card = CardFactory.heroCard(l,[],l)
  //   cards.push(card)
  // })

  // console.lof(cards)
  // const cards = [
  //   CardFactory.heroCard(""+clientProfile.selectedClient+ " and Shon",[], [""+clientProfile.selectedClient+ " and Shon"]),
  //   CardFactory.heroCard('title2', [], ['button2']),
  //   CardFactory.heroCard('title3', [], ['button3'])
  // ]

  const message = MessageFactory.carousel(cards)
  await dc.context.sendActivity(message)
  // await dc.context.sendActivity({
  //   // title: "SHON COME ON",
  //   text: "pleasssse",
  //   attachments: [cards[0]]

  // })
  /*
  const buttons = [
    "1111111",
    "22222",
    "44444"
  ]
  const message = MessageFactory.attachment(
    CardFactory.heroCard(
      "Ok. great.",
          [],
          ["The client would like to go outside once each day.", "The client would like an hour on the Xbox to play games each day", "The client would like to watch an hour comedy episode on Netflix each day"],
          {
              text: "It looks like "+clientProfile.selectedClient+" has the following 5 care plan goals in myEvolv that need to be documented for "+clientProfile.entryDate+ ". \nPlease choose the Valued Outcome/Staff Action you would like to complete documentation for"
          }
     )
);
await dc.prompt(CONFIRM_PROMPT, message)
return await dc.endDialog();
  await dc.prompt(CONFIRM_PROMPT, msg)
  // dc.send(msg)
  // await dc.prompt(CONFIRM_PROMPT, carePlansCards)
  console.log(color.blue("Messi"), message)
   return dc.endDialog()
   */
// }
