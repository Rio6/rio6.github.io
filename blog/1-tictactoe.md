# TicTacToe 圈圈叉叉 {title}
## 2015-07-24 {date}

An Android app where you can play Tictactoe with AI  
這是一個可以跟AI對戰的android app  

Some code sinppets
```java
package rio.tic_tac_toe;

import java.util.ArrayList;

import android.widget.Button;

class AI {

    Button[] btns;

    AI(Button[] btns){
        this.btns = btns;
    }

    public int getAiMove(){
        Object[][] s = new Object[3][2];

        for(int h = 0; h < 2; h++){
            for(int i = 0; i < 8; i++){

                switch(i){
                    case 0:
                    case 1:
                    case 2:
                        s[0][0] = btns[i * 3].getText().toString();
                        s[1][0] = btns[i * 3 + 1].getText().toString();
                        s[2][0] = btns[i * 3 + 2].getText().toString();

                        s[0][1] = i * 3;
                        s[1][1] = i * 3 + 1;
                        s[2][1] = i * 3 + 2;
                        break;
                    case 3:
                    case 4:
                    case 5:
                        s[0][0] = btns[i - 3].getText().toString();
                        s[1][0] = btns[i].getText().toString();
                        s[2][0] = btns[i + 3].getText().toString();

                        s[0][1] = i - 3;
                        s[1][1] = i;
                        s[2][1] = i + 3;
                        break;
                    case 6:
                        s[0][0] = btns[0].getText().toString();
                        s[1][0] = btns[4].getText().toString();
                        s[2][0] = btns[8].getText().toString();

                        s[0][1] = 0;
                        s[1][1] = 4;
                        s[2][1] = 8;
                        break;
                    case 7:
                        s[0][0] = btns[2].getText().toString();
                        s[1][0] = btns[4].getText().toString();
                        s[2][0] = btns[6].getText().toString();

                        s[0][1] = 2;
                        s[1][1] = 4;
                        s[2][1] = 6;
                        break;
                }

                String t = h == 0 ? "X" : "O";
                for(int j = 0;j < 3; j++){
                    if(s[j][0] == t && s[(j + 1) % 3][0] == t && s[(j + 2) % 3][0] == ""){
                        return (Integer) s[(j + 2) % 3][1];
                    }
                }
            }
        }

        boolean[] isEmpty = new boolean[9];

        for(int i = 0; i < btns.length; i++){
            if(btns[i].getText().toString() == "")
                isEmpty[i] = true;
        }
        if(isEmpty[4])
            return 4;

        int[] r = getRandomVerse(0, 2, 6, 8);
        for(int i = 0; i < r.length; i++){
            if(isEmpty[r[i]])
                return r[i];
        }

        for(;;){
            int rdmsel = (int)(Math.random() * 4);
            if(isEmpty[rdmsel * 2 + 1])
                return rdmsel * 2 +1;
        }

    }

    int[] getRandomVerse(int... i){
        ArrayList<Integer> al = new ArrayList<Integer>(i.length);
        int[] a = new int[i.length];
        for(int h = 0; h < i.length; h++){
            al.add(i[h]);
        }
        for(int h = 0; h < a.length; h++){
            a[h] = al.remove((int)(Math.random() * al.size()));
        }
        return a;
    }

}
```

[Dropbox](https://www.dropbox.com/sh/h0vybn9ghzw9umn/AAAnxnQmMFLcClSiAiVLj9pHa?dl=0)

![](img/tictactoe_00000.png =40%x*)
![](img/tictactoe_00001.png =40%x*)
![](img/tictactoe_00002.png =60%x*)
