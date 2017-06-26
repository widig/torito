using System;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
namespace HelloSpace
{
    public class Hello 
    {
        //teste2
        public static void Main() {
            var bmpScreenshot = new Bitmap(Screen.PrimaryScreen.Bounds.Width,Screen.PrimaryScreen.Bounds.Height, PixelFormat.Format32bppArgb);
            var gfxScreenshot = Graphics.FromImage(bmpScreenshot);
            gfxScreenshot.CopyFromScreen(
                Screen.PrimaryScreen.Bounds.X,
                Screen.PrimaryScreen.Bounds.Y,
                0,
                0,
                Screen.PrimaryScreen.Bounds.Size,
                CopyPixelOperation.SourceCopy);
            string filename = "./private/torito/tmp/Screenshot.gif";
            if(File.Exists(filename)) {
                File.Delete(filename);
            }
            bmpScreenshot.Save(filename, ImageFormat.Gif);
        }
    }
}
