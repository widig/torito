using System;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
namespace HelloSpace
{
    public class Form1 : Form {
        public Form1()
        {
            InitializeComponent();
        }
        private void InitializeComponent() 
        {
            this.Text = "Title";

            Button button1 = new Button();
            button1.Text = "OK";
            button1.Location = new Point (10, 10);
            button1.Click += button1_Click;

            Button button2 = new Button();
            button2.Text = "Cancel";
            button2.Location = new Point (button1.Left, button1.Height + button1.Top + 10);
            button2.Click += button2_Click;
            
            this.Controls.Add(button1);
            this.Controls.Add(button2);

        }
        private void button1_Click(object sender, System.EventArgs e)
        {
            MessageBox.Show("ok", "title", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        private void button2_Click(object sender, System.EventArgs e)
        {
            MessageBox.Show("cancel", "title", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }
    public class Hello 
    {
        public static void Main() {
            Application.Run(new Form1());
            Console.WriteLine("ok");
        }
    }
}

