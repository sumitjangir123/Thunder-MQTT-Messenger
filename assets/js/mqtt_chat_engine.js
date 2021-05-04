class ChatEngine1{
    constructor(userEmail,arr){
        this.userEmail= userEmail;

        var client = new Paho.MQTT.Client("broker.hivemq.com", 8000, "/mqtt" , userEmail);

        
        // set callback handlers
        client.onConnectionLost = onConnectionLost;
        client.onMessageArrived = onMessageArrived;

        // connect the client
        client.connect({onSuccess:onConnect});


        // called when the client connects
        function onConnect() {
        // Once a connection has been made, make a subscription and send a message.
        console.log(userEmail," Connected");

        client.subscribe("universal");
        arr.forEach(function (arrayItem) {
            var x = arrayItem.topic;
            client.subscribe(x);
        });

        var message = new Paho.MQTT.Message(userEmail+" joined");
        message.destinationName = "universal";
        client.send(message);
        }

        // called when the client loses its connection
        function onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:"+responseObject.errorMessage);
        }
        }

        // called when a message arrives
        function onMessageArrived(message) {
            console.log("onMessageArrived:"+ message.payloadString);

            temp();
            function temp () {
          
                $('#notifyType').text(message.payloadString);
                $(".notify").toggleClass("active");
                $("#notifyType").toggleClass("success");
                var sound = document.getElementById("myAudio"); 
                playAudio();
                function playAudio() { 
                    sound.play();
                } 
                
                setTimeout(function(){
                  $(".notify").removeClass("active");
                  $("#notifyType").removeClass("success");
                },5000);
              }


            //showing notification
            const notification = new Notification("New message incoming", {
                body: message.payloadString,
                icon: "https://i.postimg.cc/26cTG9s9/Thunderbird-Logo.png"
            })
        }

        if (Notification.permission === "granted") {
           
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
            });
        }


        document.getElementById('publish').addEventListener('click', function() {

            var msg=document.getElementById("message-text").value;
            var topic=document.getElementById("topic").value;

            if(msg.length ==0 || topic.length == 0){
                return;
            }


            var message = new Paho.MQTT.Message(msg);

            message.destinationName = topic;
            client.send(message);
        }, false);
    }
}