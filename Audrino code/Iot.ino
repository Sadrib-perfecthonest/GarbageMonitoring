const int trigPin = 9;
const int echoPin = 10;
const int ledPin = 7;

int fillStep = 0;  
long lastDistance = 0;  
long currentDistance = 0;  
unsigned long lastUpdateTime = 0;
unsigned long fullLevelStartTime = 0;
bool holdingAtFull = false;

const unsigned long interval = 1000;          
const unsigned long holdDuration = 10000;      
const int thresholdIncrease = 5;               
const int thresholdDecrease = 10;             

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("System Ready. Starting Fill at 0%");
  
}

void loop() {
  // Trigger ultrasonic pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);  
 currentDistance = (duration / 2) / 29.1;


Serial.print("Raw duration: ");
Serial.print(duration);
Serial.print(" µs → Distance: ");
Serial.print(currentDistance);
Serial.println(" cm");

  currentDistance = (duration / 2) / 29.1;  

  unsigned long currentTime = millis();

  if (holdingAtFull && currentTime - fullLevelStartTime >= holdDuration) {
    holdingAtFull = false;
    Serial.println("Hold time completed. Ready to detect changes again.");
  }

  if (currentTime - lastUpdateTime > interval && !holdingAtFull) {
    if (currentDistance > lastDistance + thresholdIncrease && fillStep < 3) {
      fillStep++;  
      Serial.println("Dust added → Fill increased");

      
      if (fillStep == 3) {
        holdingAtFull = true;
        fullLevelStartTime = currentTime;
        Serial.println("Fill is 100% — holding for 20 seconds...");
      }
    }

   if (lastDistance - currentDistance > thresholdDecrease) {
      fillStep = 0;  
      Serial.println("Dust removed → Fill reset to 0%");
    }


    lastDistance = currentDistance;
    lastUpdateTime = currentTime;
  }

  
  int percentage = 0;
  switch (fillStep) {
    case 1: percentage = 20; break;
    case 2: percentage = 50; break;
    case 3: percentage = 100; break;
    default: percentage = 0; break;
  }

  
  Serial.print("Fill: ");
  Serial.print(percentage);
  Serial.println("%");

  
 if (fillStep == 3 ) {
  digitalWrite(ledPin, HIGH);
} else {
  digitalWrite(ledPin, LOW);
}


  delay(300);  
}






