#include "ESP8266.h"
#include <SoftwareSerial.h>
#include <dht11.h>
#include <dht.h>
#include <dht11.h>

#define SSID "ThomasHo"
#define PASSWORD "36963696"
#define HOST_NAME "192.168.43.197"
#define URL_MOTION "motion"
#define URL_TEMP "api/temperature_and_humidity"

#define dhtpin 7 // set the pin to connect to DHT11

dht11 DHT11; // create object of DHT11
int n = 0;
const int PIR1 = 4;
const int PIR2 = 8;
int calibrationTime = 30;
int PIRValue = 0;
int PIRValue2 = 0;
long unsigned int lowIn;
long unsigned int lowIn2;
long unsigned int pause = 50;
boolean lockLow = true;
boolean lockLow2 = true;
boolean takeLowTime;
boolean takeLowTime2;

boolean goIn = false;
boolean goOut = false;

SoftwareSerial mySerial(2, 3); //RX, TX
ESP8266 wifi(mySerial);

/**
* 初期設定
*/
void setup(void)
{
    Serial.begin(9600);

    if (wifi.setOprToStationSoftAP())
    {
        Serial.println("to station ok");
    }
    else
    {
        Serial.println("to station error");
    }

    if (wifi.joinAP(SSID, PASSWORD))
    {
        Serial.println("connect success");
    }
    else
    {
        Serial.println("connect error");
    }

    if (wifi.disableMUX())
    {
        Serial.println("disable mux success");
    }
    else
    {
        Serial.println("disable mux error");
    }

    pinMode(PIR1, INPUT);
    pinMode(PIR2, INPUT);
}

void loop(void)
{
    //PIRSensor();

    HumidityAndTempSensor();
}

float getTemp(char type)
{
    float temp = (float)DHT11.temperature; //get temp
    if (type == 'F')
    {
        return temp * 1.8 + 32; // convert to fahrenheit
    }
    else if (type == 'K')
    {
        return temp + 274.15; // convert to Kelvin
    }
    else
    {
    }

    return temp;
}

void HumidityAndTempSensor()
{
    DHT11.read(dhtpin); // initialize the reading
    //code for Robojax.com video
    int humidity = DHT11.humidity; // get humidity
    float temp = getTemp('C');

    //  Serial.print("temperature:");
    //  Serial.print(temp);
    //  Serial.print("C ");
    //Serial.print(getTemp('F'));
    //Serial.print("F ");
    //Serial.print(getTemp('K'));
    //Serial.print("K ");
    //  Serial.print(" humidity:");
    //  Serial.print (humidity);
    //  Serial.println("% ");
    //  Serial.println();
    sendTempData(temp, humidity);
    //  delay(1000);
}

void sendMotionData(int count)
{
    wifi.createTCP(HOST_NAME, 3000);
    char sendStr[128];
    sprintf(sendStr, "POST /%s?count=%d HTTP/1.0\r\nHost: %s\r\nUser-Agent: arduino\r\n\r\n", URL_MOTION, count, HOST_NAME);
    wifi.send((const uint8_t *)sendStr, strlen(sendStr));

    //  Serial.println(n);
}

void sendTempData(float temp, int hum)
{
    wifi.createTCP(HOST_NAME, 3000);
    char sendStr[128];
    sprintf(sendStr, "POST /%s?temp=%d&hum=%d HTTP/1.0\r\nHost: %s\r\nUser-Agent: arduino\r\n\r\n", URL_TEMP, (int)temp, hum, HOST_NAME);
    wifi.send((const uint8_t *)sendStr, strlen(sendStr));

    //  Serial.println(temp);
}

void PIRSensor()
{

    //PIR1
    {
        if (digitalRead(PIR1) == HIGH)
        {
            if (lockLow)
            {
                PIRValue = 1;
                lockLow = false;
                Serial.println("PIR1: Motion detected.");
                // delay(500);
            }
            takeLowTime = true;
        }
        if (digitalRead(PIR1) == LOW)
        {
            if (takeLowTime)
            {
                lowIn = millis();
                takeLowTime = false;
            }
            if (!lockLow && millis() - lowIn > pause)
            {
                PIRValue = 0;
                lockLow = true;
                Serial.println("PIR1: Motion ended.");
                // delay(500);
            }
        }
    }

    //PIR2
    {
        if (digitalRead(PIR2) == HIGH)
        {
            if (lockLow2)
            {
                PIRValue2 = 1;
                lockLow2 = false;
                Serial.println("PIR2: Motion detected.");
                // delay(500);
            }
            takeLowTime2 = true;
        }
        if (digitalRead(PIR2) == LOW)
        {
            if (takeLowTime2)
            {
                lowIn2 = millis();
                takeLowTime2 = false;
            }
            if (!lockLow2 && millis() - lowIn2 > pause)
            {
                PIRValue2 = 0;
                lockLow2 = true;
                Serial.println("PIR2: Motion ended.");
                // delay(500);
            }
        }
    }
    if (goIn == false && goOut == false && PIRValue == 1)
    {
        goIn = true;
    }
    else if (goIn == true && goOut == false && PIRValue2 == 0)
    {
        sendMotionData(1);
        goIn = false;
    }
    if (goOut == false && goIn == false && PIRValue2 == 1)
    {
        goOut = true;
    }
    else if (goOut == true && goIn == false && PIRValue == 0)
    {
        sendMotionData(-1);
        goOut = false;
    }
    delay(500);
}