//System.IO.File.Move("oldfilename", "newfilename");
using System;
using System.Drawing;
namespace HelloSpace
{
    public class Hello 
    {
        public static string hex(byte b) {
            string str = BitConverter.ToString(new byte[] { b });
            if(str.Length == 1) return "0" + str;
            return str;
        }
        public static void printJsonImage(string file) {
            Console.WriteLine("{");
            Console.WriteLine("\"type\":\"image\",");
            Console.WriteLine("\"data\":{");
            Bitmap image1 = (Bitmap)Image.FromFile(file, false);
            Console.WriteLine("\"width\":"+image1.Width+",");
            Console.WriteLine("\"height\":"+image1.Height+",");
            Console.Write("\"raw\":\"");
            for(int y = 0; y < image1.Height;y++) {
                for(int x = 0; x < image1.Width;x++) {
                    Color c = image1.GetPixel(x,y);
                    Console.Write("{0}",hex(c.R));
                    Console.Write("{0}",hex(c.G));
                    Console.Write("{0}",hex(c.B));
                }
            }
            Console.WriteLine("\"");
            Console.WriteLine("}");
            Console.WriteLine("}");
        }
        public static void Main() {
            string[] files = System.IO.Directory.GetFiles(".\\private\\user\\root\\images\\a1");
            foreach(string s in files) {
                printJsonImage(s);
                break;
            }
        }
    }
}

