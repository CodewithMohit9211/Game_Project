import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Random;

public class DodgeTheBlocks extends JPanel
        implements ActionListener, KeyListener {

    // Screen
    static final int WIDTH = 500;
    static final int HEIGHT = 500;

    // Player
    int playerSize = 50;
    int playerX = WIDTH / 2;
    int playerY = HEIGHT - playerSize - 10;
    int playerSpeed = 10;

    // Enemy
    int enemySize = 50;
    int enemySpeed = 15;

    ArrayList<Rectangle> enemies = new ArrayList<>();
    Random random = new Random();

    // Game
    int score = 0;
    boolean running = true;

    boolean leftPressed = false;
    boolean rightPressed = false;

    Timer timer;

    // Constructor
    public DodgeTheBlocks() {

        setPreferredSize(new Dimension(WIDTH, HEIGHT));
        setBackground(Color.WHITE);

        addKeyListener(this);
        setFocusable(true);

        // Game runs about 30 times per second
        timer = new Timer(33, this);
        timer.start();
    }

    // Create an enemy
    void dropEnemy() {

    int x = random.nextInt(WIDTH - enemySize + 1);

    enemies.add(
        new Rectangle(
            x,
            0,
            enemySize,
            enemySize
        )
    );
}

    // Move enemies
    void updateEnemies() {

        Iterator<Rectangle> iterator = enemies.iterator();

        while (iterator.hasNext()) {

            Rectangle enemy = iterator.next();

            enemy.y += enemySpeed;

            // Remove enemy when it leaves the screen
            if (enemy.y >= HEIGHT) {
                iterator.remove();
            }
        }
    }

    // Check collision
    void checkCollision() {

        Rectangle player = new Rectangle(
            playerX,
            playerY,
            playerSize,
            playerSize
        );

        for (Rectangle enemy : enemies) {

            if (player.intersects(enemy)) {

                running = false;
                timer.stop();

                System.out.println(
                    "Game Over! Final Score: " + score
                );

                JOptionPane.showMessageDialog(
                    this,
                    "Game Over!\nFinal Score: " + score
                );

                return;
            }
        }
    }

    // Draw everything
    @Override
    protected void paintComponent(Graphics g) {

        super.paintComponent(g);

        // Draw player
        g.setColor(Color.BLUE);

        g.fillRect(
            playerX,
            playerY,
            playerSize,
            playerSize
        );

        // Draw enemies
        g.setColor(Color.RED);

        for (Rectangle enemy : enemies) {

            g.fillRect(
                enemy.x,
                enemy.y,
                (int) enemy.width,
                enemy.height
            );
        }

        // Draw score
        g.setColor(Color.BLACK);

        g.setFont(
            new Font("Arial", Font.BOLD, 20)
        );

        g.drawString(
            "Score: " + score,
            10,
            25
        );
    }

    // Game loop
    @Override
    public void actionPerformed(ActionEvent e) {

        if (!running) {
            return;
        }

        // Move player left
        if (leftPressed && playerX > 0) {
            playerX -= playerSpeed;
        }

        // Move player right
        if (rightPressed &&
            playerX < WIDTH - playerSize) {

            playerX += playerSpeed;
        }

        // Randomly create enemies
        if (random.nextInt(20) == 0) {
            dropEnemy();
        }

        // Move enemies
        updateEnemies();

        // Check collision
        checkCollision();

        // Increase score
        score++;

        // Redraw screen
        repaint();
    }

    // Keyboard pressed
    @Override
    public void keyPressed(KeyEvent e) {

        if (e.getKeyCode() == KeyEvent.VK_LEFT) {
            leftPressed = true;
        }

        if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
            rightPressed = true;
        }
    }

    // Keyboard released
    @Override
    public void keyReleased(KeyEvent e) {

        if (e.getKeyCode() == KeyEvent.VK_LEFT) {
            leftPressed = false;
        }

        if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
            rightPressed = false;
        }
    }

    @Override
    public void keyTyped(KeyEvent e) {
        // Not needed
    }

    // Main method
    public static void main(String[] args) {

        JFrame frame =
            new JFrame("Dodge the Blocks");

        DodgeTheBlocks game =
            new DodgeTheBlocks();

        frame.add(game);

        frame.pack();

        frame.setDefaultCloseOperation(
            JFrame.EXIT_ON_CLOSE
        );

        frame.setLocationRelativeTo(null);

        frame.setResizable(false);

        frame.setVisible(true);

        game.requestFocusInWindow();
    }
}