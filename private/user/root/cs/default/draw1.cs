//System.IO.File.Move("oldfilename", "newfilename");
using System;
using System.Drawing;
using System.Reflection;
using System.Collections.Generic;

namespace HelloSpace
{
    public class OP8 { // small images, raster operator
        ulong[] data;
        byte it;
        public OP8() { 
            this.data = new ulong[4];
            this.data[0] = 0;
            this.data[1] = 0;
            this.data[2] = 0;
            this.data[3] = 0;
            this.it = 0;
        }
        public OP8(byte[] data,byte it) {
            this.data = new ulong[4];
            this.setBytes(data);
            this.it = it;
        }
        public void setBytes( byte[] data ) {
            if(data.Length != 32) throw new Exception( "invalid size for this op." );
            for(int x = 0; x < 32;x++) {
                int m = x % 8;
                int p = ( x - m ) / 8;
                ulong c = 0xFF;
                c <<= ( 8 * m );
                c = ~c;
                this.data[p] &= c;
                c = data[x];
                this.data[p] |= ( c << ( 8 * m ) );
            }
        }
        public byte[] getBytes() {
            byte[] ret = new byte[32];
            int c = 0;
            for(int x = 0; x < 4;x++) {
                for(int y = 0; y < 8;y++) {
                    ulong i = 0xFF;
                    ret[c++] = (byte) ( ( this.data[x] & ( i << ( 8 * y ) ) ) >> ( 8 * y ) );
                }
            }
            return ret;
        }
        private float saturation() { // best saturation is 0, worst saturation(1) leads to shortcut
            byte[] t = this.getBytes();
            float r = 0;
            for(int x = 0; x < 256;x++) {
                int m = x % 8;
                int p = ( x - m ) / 8;
                if( ( t[p] & ( 1 << m ) ) > 0) {
                    r += 1;
                }
            }
            return r/256.0f;
        }
        private void next_it() {
            int i = this.it;
            i = (i + 1)%256;
            this.it = (byte)i;
        }
        public void include(byte min, byte max) {
            byte b1 = min < max ? min : max;
            byte b2 = min < max ? max : min;
            int m1 = b1 % 64;
            int p1 = (b1 -m1 ) / 64;
            int m2 = b2 % 64;
            int p2 = (b2 -m2) / 64;
            for(int x = 0; x < 4;x++) {
                if( x >= p1 && x <= p2) {
                    if(x == p1) {
                        if(p2>p1) for(int y = m1; y < 64;y++) this.data[x] |= (ulong)( (ulong)1 << y );
                        else for(int y = m1; y < m2;y++) this.data[x] |= (ulong)( (ulong)1 << y );
                    } else if(x == p2) {
                        for(int y = 0; y < m2;y++) this.data[x] |= (ulong)( (ulong)1 << y);
                    } else {
                        for(int y = 0; y < 64;y++) this.data[x] |= (ulong)( (ulong)1 << y);
                    }
                }
            }
        }
        public void exclude(byte min, byte max) {
            byte b1 = min < max ? min : max;
            byte b2 = min < max ? max : min;
            int m1 = b1 % 64;
            int p1 = (b1 -m1 ) / 64;
            int m2 = b2 % 64;
            int p2 = (b2 -m2) / 64;
            for(int x = 0; x < 4;x++) {
                if( x >= p1 && x <= p2) {
                    if(x == p1) {
                        if(p2>p1) for(int y = m1; y < 64;y++) this.data[x] &= (ulong) ~( (ulong)1 << y );
                        else for(int y = m1; y < m2;y++) this.data[x] &= (ulong)~( (ulong)1 << y );
                    } else if(x == p2) {
                        for(int y = 0; y < m2;y++) this.data[x] &= (ulong)~( (ulong)1 << y);
                    } else {
                        for(int y = 0; y < 64;y++) this.data[x] &= (ulong)~( (ulong)1 << y);
                    }
                }
            }
        }
        public OP8 Mutate() {
            int at = this.it;
            next_it();
            byte[] t = this.getBytes();
            int m = at % 8;
            int p = ( at - m ) / 8;
            if( ( t[p] & ( 1 << m ) ) > 0) {
                // switch to 0
                byte b = 1;
                t[p] &= (byte) ( ~( b << m ) );
            } else {
                // switch to 1
                byte b = 1;
                t[p] |= (byte)( b << m );
            }
            return new OP8(t,this.it);
        }
        
        public string bin() {
            byte[] t = this.getBytes();
            string ret = "";
            for(int x = 0; x < 256;x++) {
                int m = x % 8;
                int p = ( x - m ) / 8;
                if( ( t[p] & ( 1 << m ) ) > 0) {
                    ret += "1";
                } else {
                    ret += "0";
                }
            }
            return ret;
        }
        public bool eval( byte data ) {
            int m = data % 64;
            int p = ( data - m ) / 64;
            ulong i = 1;
            bool r = ( this.data[p] & ( i << m )  ) > 0;
            return r;
        }
    }

    public class Hello 
    {
        public static string hex(byte b) {
            string str = BitConverter.ToString(new byte[] { b });
            if(str.Length == 1) return "0" + str;
            return str;
        }
        public static void DrawToScreen() { // veen sample to recognize intersection
            int w = 256;
            int h = 256;
            Console.WriteLine("{");
            Console.WriteLine("\"type\":\"image\",");
            Console.WriteLine("\"data\":{");
            Console.WriteLine("\"width\":"+w+",");
            Console.WriteLine("\"height\":"+h+",");
            Console.Write("\"raw\":\"");
            Random rnd = new Random();
            for(int y = 0; y < w;y++) {
                for(int x = 0; x < h;x++) {
                    Color c = Color.White;
                    
                    float _x = (float)x;
                    float _y = (float)y;
                    float _dx1 = _x - 256.0f/4.0f;
                    float _dy1 = _y - 256.0f/2.0f;
                    if( _dx1*_dx1 + _dy1*_dy1 < 96*96 ) {
                        if( rnd.Next(64) > 60 ) {
                            c = Color.Red;
                        }
                    }
                    float _dx2 = _x - 3.0f*256.0f/4.0f;
                    float _dy2 = _y - 256.0f/2.0f;
                    if( _dx2*_dx2 + _dy2*_dy2 < 96*96 ) {
                        if( rnd.Next(64) > 60 ) {
                            c = Color.Blue;
                        }
                    }
                    Console.Write("{0}",hex(c.R));
                    Console.Write("{0}",hex(c.G));
                    Console.Write("{0}",hex(c.B));
                }
            }
            Console.WriteLine("\"");
            Console.WriteLine("}");
            Console.WriteLine("}");
        }
        public static byte[] DrawToArray() {
            int w = 256;
            int h = 256;
            byte[] ret = new byte[w*h*4];
            Random rnd = new Random();
            int p = 0;
            for(int y = 0; y < w;y++) {
                for(int x = 0; x < h;x++) {
                    int pos = p*4;
                    Color c = Color.White;
                    float _x = (float)x;
                    float _y = (float)y;
                    float _dx1 = _x - 256.0f/4.0f;
                    float _dy1 = _y - 256.0f/2.0f;
                    if( _dx1*_dx1 + _dy1*_dy1 < 96*96 ) {
                        if( rnd.Next(64) > 60 ) {
                            c = Color.Red;
                        }
                    }
                    float _dx2 = _x - 3.0f*256.0f/4.0f;
                    float _dy2 = _y - 256.0f/2.0f;
                    if( _dx2*_dx2 + _dy2*_dy2 < 96*96 ) {
                        if( rnd.Next(64) > 60 ) {
                            c = Color.Blue;
                        }
                    }
                    ret[pos+0] = c.R;
                    ret[pos+1] = c.G;
                    ret[pos+2] = c.B;
                    ret[pos+3] = 255;
                    p += 1;
                }
            }
            return ret;
        }
        public static void Main() {
            if(false) {
                DrawToScreen();
            } else {
                try {
                    byte[] data = DrawToArray();
                    List<Color> clist = new List<Color>();
                    Dictionary<string,int> dictName2Index = new Dictionary<string,int>();
                    Dictionary<int,string> dictIndex2Name = new Dictionary<int,string>();

                    // nearest of Color
                    PropertyInfo[] props = typeof(Color).GetProperties();
                    //Console.WriteLine(props.Length);
                    
                    int count = 0;
                    Dictionary<byte,List<int>> dictR = new Dictionary<byte,List<int>>();
                    Dictionary<byte,List<int>> dictG = new Dictionary<byte,List<int>>();
                    Dictionary<byte,List<int>> dictB = new Dictionary<byte,List<int>>();
                    Dictionary<byte,List<int>> dictA = new Dictionary<byte,List<int>>();
                    for(int x = 0; x < 256;x++) {
                        dictR.Add((byte)x,new List<int>());
                        dictG.Add((byte)x,new List<int>());
                        dictB.Add((byte)x,new List<int>());
                        dictA.Add((byte)x,new List<int>());
                    }

                    foreach(PropertyInfo p in props) {
                        if( p.PropertyType.Name == "Color" ) {
                            Color c = (Color)p.GetValue(null, null);
                            clist.Add(c);
                            int i = clist.Count-1;
                            dictName2Index.Add(p.Name,i);
                            dictIndex2Name.Add(i,p.Name);
                            dictR[ c.R ].Add( i );
                            dictG[ c.G ].Add( i );
                            dictB[ c.B ].Add( i );
                            dictA[ c.A ].Add( i );
                            //Console.Write("{0},",p.Name);
                            //if(count%5==4) Console.WriteLine();
                            count += 1;
                        }
                    }

                    // get nearest pallete of image
                    int w = 256;
                    int h = 256;
                    int p2 = 0;
                    
                    int[] img = new int[w*h];
                    List<int> mlist = new List<int>();
                    int it = 0;
                    for(int y = 0; y < h;y++) {
                        for(int x = 0; x < w;x++) {
                            int pos = p2*4;
                            int sel = -1;
                            Color c1 = Color.Transparent;
                            Color c2 = Color.FromArgb( data[pos], data[pos+1], data[pos+2], data[pos+3] );
                            for(int k = 0; k < dictR[ data[pos] ].Count;k++) {
                                it++;
                                Color c3 = clist[ dictR[ data[pos] ][k] ];
                                if( Math.Abs( c2.GetHue() - c3.GetHue() ) < Math.Abs( c2.GetHue() - c1.GetHue() ) ) {
                                    c1 = c3;
                                    sel = dictR[ data[pos] ][k];
                                }
                            }
                            for(int k = 0; k < dictG[ data[pos+1] ].Count;k++) {
                                it++;
                                Color c3 = clist[ dictG[ data[pos+1] ][k] ];
                                if( Math.Abs( c2.GetHue() - c3.GetHue() ) < Math.Abs( c2.GetHue() - c1.GetHue() ) ) {
                                    c1 = c3;
                                    sel = dictG[ data[pos+1] ][k];
                                }
                            }
                            for(int k = 0; k < dictB[ data[pos+2] ].Count;k++) {
                                it++;
                                Color c3 = clist[ dictB[ data[pos+2] ][k] ];
                                if( Math.Abs( c2.GetHue() - c3.GetHue() ) < Math.Abs( c2.GetHue() - c1.GetHue() ) ) {
                                    c1 = c3;
                                    sel = dictB[ data[pos+2] ][k];
                                }
                            }
                            if(sel!=-1) {
                                bool check = false;
                                for(int k = 0; k < mlist.Count;k++) {
                                    it++;
                                    if(mlist[k] == sel) {
                                        check = true;
                                        break;
                                    }
                                }
                                if(!check) mlist.Add(sel);
                                Console.Write("1");
                            } else {
                                Console.Write("0");
                            }
                            p2 += 1;
                        }
                    }
                    Console.WriteLine();
                    Console.WriteLine("{0}",mlist.Count); // selected shortest discrete colors
                    Console.WriteLine("{0}",it);
                    

                } catch(Exception e) {
                    Console.WriteLine(e.Message);
                }

            }
        }

    }
}

