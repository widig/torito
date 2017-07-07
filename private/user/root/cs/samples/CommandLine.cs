using System;
using System.Numerics;
namespace HelloSpace
{
    public class Hello 
    {
        public static void Main() {
            BigInteger bi1 = new BigInteger(1);
            BigInteger bi10 = new BigInteger(10);
            BigInteger bi_var = new BigInteger(1);
            for(var x = 0; x < 36;x++) { bi_var *= bi10; }
            BigInteger number = bi_var;
            byte[] bytes = number.ToByteArray();
            Console.WriteLine("THE UNIT:");
            Console.Write("{0} -> ", number );
            Console.Write("{0} bytes: ", bytes.Length);
            foreach (byte byteValue in bytes) Console.Write("{0:X2} ", byteValue);
            Console.WriteLine();

            /*
                var obj = {
                    points : [
                        {
                            position : ["0m","0m","0m"],
                            mass : "1kg",
                            radius : "1m",
                            geometry : "box", // sphere
                            material : 0
                        }
                    ],
                    inertia : [
                        tspeed : ["1m/s","0m/s","0m/s"],
                        rspeed : ["1rad/s","0rad/s","0rad/s"]
                    ],
                    materials : [
                        {
                            formulae : "Fe",
                            temperature : "0C",
                            charge : "1C"
                        }
                    ]
                };
                var scene = {
                    objects : [obj],
                    fields : [],
                    events : []
                };
                Simulate( scene, timeSpan, resolution, function(scene, timeElapsed, next) {
                    // plot and control the scene

                    next();
                });  // send to backend 
                convert to SI before sending to c#.

            */

        }
    }
}
